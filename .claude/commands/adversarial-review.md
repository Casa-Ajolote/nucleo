# /adversarial-review — Revisión Adversarial de Código

Lanza 4 agentes atacantes que intentan activamente ROMPER tu código.
A diferencia de `/review-loop` (que busca calidad), esto busca **vulnerabilidades**.

**Requiere:** `codex` CLI instalado + `OPENAI_API_KEY` configurada.

---

## Cuándo usar

| Situación | Comando |
|-----------|---------|
| Review de calidad general | `/review-loop` |
| **Buscar vulnerabilidades y fallos** | **`/adversarial-review`** |
| Review de producto/UX | `/fragua-review` |

Úsalo después de completar una feature, antes de deploy, o cuando quieras stress-test.

---

## Los 4 Agentes Atacantes

| Agente | Rol | Busca |
|--------|-----|-------|
| El Intruso | Pentester senior | OWASP Top 10, injection, auth bypass, IDOR, secrets |
| El Caos | Chaos engineer | Race conditions, cascadas, memory leaks, consistencia |
| El Destructor | QA adversarial | Boundary values, unicode, prototype pollution, dates |
| El Saboteador | Usuario malicioso | Doble-click, back button, expired sessions, offline |

---

## Protocolo de Ejecución

Al recibir `/adversarial-review [scope opcional]`, ejecutar:

### Paso 1: Setup

```bash
set -e

# Verificar dependencias
command -v jq >/dev/null 2>&1 || { echo "Error: jq requerido. brew install jq"; exit 1; }
command -v codex >/dev/null 2>&1 || { echo "Error: Codex CLI no instalado. Ejecuta: npm install -g @openai/codex"; exit 1; }

# Generar Attack ID
ATTACK_ID="$(date +%Y%m%d-%H%M%S)-$(openssl rand -hex 3 2>/dev/null || head -c 3 /dev/urandom | od -An -tx1 | tr -d ' \n')"

# Asegurar multi-agent habilitado
CODEX_CONFIG="${HOME}/.codex/config.toml"
if [ ! -f "$CODEX_CONFIG" ]; then
  mkdir -p "${HOME}/.codex"
  printf '[features]\nmulti_agent = true\n' > "$CODEX_CONFIG"
  echo "Creado ~/.codex/config.toml con multi_agent habilitado"
elif ! grep -qE '^\s*multi_agent\s*=\s*true' "$CODEX_CONFIG"; then
  if grep -qE '^\[features\]' "$CODEX_CONFIG"; then
    if [ "$(uname)" = "Darwin" ]; then
      sed -i '' '/^\[features\]/a\'$'\n''multi_agent = true' "$CODEX_CONFIG"
    else
      sed -i '/^\[features\]/a multi_agent = true' "$CODEX_CONFIG"
    fi
  else
    printf '\n[features]\nmulti_agent = true\n' >> "$CODEX_CONFIG"
  fi
  echo "multi_agent habilitado en ~/.codex/config.toml"
fi

mkdir -p reviews
chmod +x .claude/hooks/adversarial-attack.sh

echo ""
echo "Adversarial Review activado"
echo "  Attack ID: ${ATTACK_ID}"
echo "  Report:    reviews/adversarial-${ATTACK_ID}.md"
echo ""
```

### Paso 2: Ejecutar ataque

```bash
.claude/hooks/adversarial-attack.sh "$ATTACK_ID" "reviews/adversarial-${ATTACK_ID}.md" "$SCOPE"
```

Donde `$SCOPE` es el argumento opcional que el usuario pasó (ej: "auth flow", "payment system", "API routes").

Si no se pasó scope, dejar vacío — el ataque cubrirá todo el proyecto.

### Paso 3: Presentar resultados

Lee el reporte generado en `reviews/adversarial-${ATTACK_ID}.md` y presenta al usuario:

1. **Resilience Score** — el número principal (X/100)
2. **Attack Surface Summary** — la tabla resumen
3. **CRÍTICOS primero** — estos necesitan fix inmediato
4. Para cada hallazgo: vector + reproducción + fix recomendado
5. **Vectores Resistidos** — destacar lo que SÍ aguantó (refuerza confianza)
6. Preguntar: "¿Qué vulnerabilidades quieres abordar primero?"

**REGLAS:**
- Presenta TODOS los críticos, no omitas ninguno
- Para cada hallazgo, ofrece tu evaluación independiente (¿estás de acuerdo? ¿es un falso positivo?)
- Sugiere priorización: críticos → altos → medios
- Si el Resilience Score es < 50: recomendar pausar deployment
- Si el Resilience Score es > 80: felicitar pero no bajar la guardia
