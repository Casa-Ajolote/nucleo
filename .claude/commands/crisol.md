# /crisol — Validacion Estrategica Post-Blueprint

> *"El crisol prueba el metal antes de forjarlo. Si tu estrategia no sobrevive el crisol, no sobrevivira el mercado."*

Ejecuta un pipeline de 7 analisis estrategicos en orden de dependencia y produce un **dashboard ejecutivo consolidado** con veredicto go/no-go.

## Cuando Usar

```
/crisol                    → Pipeline completo (detecta docs existentes)
/crisol desde brujula      → Forzar inicio desde brujula (ignorar existentes)
/crisol dashboard          → Solo generar dashboard (requiere los 7 docs)
```

## Pre-Check (Silencioso)

Antes de cargar El Crisol, verificar:

```bash
ISSUES=""
[ ! -d .claude/skills/el-crisol ] && ISSUES="${ISSUES}El Crisol no encontrado; "
echo "${ISSUES:-OK}"
```

- Si **"OK"**: Proceder con el Protocolo de Activacion.
- Si hay issues:

```
El Crisol no esta disponible en este proyecto.
→ Ejecuta /forge-check para diagnosticar, o instala Forge con el alias forge.
```

### Verificar Blueprint (Recomendado, no obligatorio)

```bash
ls BLUEPRINT-*.md 2>/dev/null || echo "NO_BLUEPRINT"
```

- Si hay Blueprint: usarlo como contexto principal. Extraer `[nombre]` del filename.
- Si NO hay Blueprint:

```
No encontre un Blueprint en este proyecto.

El Crisol funciona mejor con un Blueprint (usa /plan para generarlo).
Pero puedo ejecutar la validacion estrategica sin el — usare los documentos
que encuentre (BMC, PDR, etc.) o te entrevistare.

Continuar sin Blueprint?
```

Si acepta: continuar. Si no: sugerir `/plan`.

---

## Protocolo de Activacion

Al recibir `/crisol`:

1. **Cargar el skill** — Leer `.claude/skills/el-crisol/SKILL.md` completo
2. **Detectar estado** — Escanear docs de estrategia existentes
3. **Ejecutar** — Seguir el protocolo del orchestrator en SKILL.md
4. **Al terminar** — Generar dashboard + mostrar veredicto

## Notas

- Cada paso delega al comando `/[nombre]` correspondiente — no reinventa la logica
- Si el usuario ya tiene algunos docs de estrategia, se reutilizan (no se regeneran)
- El dashboard HTML es standalone (Chart.js via CDN, abre en cualquier browser)
- El orden de ejecucion es por dependencia, no arbitrario
