# /retro — Retrospectiva de Ingeniería

> *"El forjador revisa su semana. Sin reflexión, cada sesión empieza desde cero."*

Genera una retrospectiva de ingeniería analizando historial de commits, patrones de trabajo, velocidad de shipping, y calidad de código. Team-aware: identifica al usuario, luego analiza cada contribuidor con praise y oportunidades de crecimiento.

## Argumentos

```
/retro                  — últimos 7 días (default)
/retro 24h              — últimas 24 horas
/retro 14d              — últimos 14 días
/retro 30d              — últimos 30 días
/retro compare          — comparar periodo actual vs periodo anterior
/retro compare 14d      — comparar con ventana explícita
```

## Instrucciones

Parsear el argumento para determinar la ventana. Default: 7 días. Usar `--since="N days ago"` para queries git.

**Validación:** Si el argumento no matchea un número + `d`/`h`/`w`, la palabra `compare`, o `compare` + número + `d`/`h`/`w`, mostrar usage y parar.

### Paso 1: Gather Raw Data

Fetch origin e identificar usuario actual:

```bash
git fetch origin main --quiet
git config user.name
git config user.email
```

El nombre retornado es **"tú"** — el Forjador leyendo esta retro. Los demás son compañeros.

Ejecutar TODOS estos comandos en paralelo (son independientes):

```bash
# 1. Commits con timestamps, subject, hash, autor, files changed
git log origin/main --since="<window>" --format="%H|%aN|%ae|%ai|%s" --shortstat

# 2. Per-commit test vs total LOC breakdown
git log origin/main --since="<window>" --format="COMMIT:%H|%aN" --numstat

# 3. Timestamps para detección de sesiones y distribución horaria
git log origin/main --since="<window>" --format="%at|%aN|%ai|%s" | sort -n

# 4. Archivos más frecuentemente cambiados (hotspot analysis)
git log origin/main --since="<window>" --format="" --name-only | grep -v '^$' | sort | uniq -c | sort -rn

# 5. Números de PR de mensajes de commit
git log origin/main --since="<window>" --format="%s" | grep -oE '#[0-9]+' | sed 's/^#//' | sort -n | uniq | sed 's/^/#/'

# 6. Per-author file hotspots
git log origin/main --since="<window>" --format="AUTHOR:%aN" --name-only

# 7. Conteos de commits por autor
git shortlog origin/main --since="<window>" -sn --no-merges
```

### Paso 2: Calcular Métricas

Presentar tabla de resumen:

| Métrica | Valor |
|---------|-------|
| Commits en main | N |
| Contribuidores | N |
| PRs mergeados | N |
| Total insertions | N |
| Total deletions | N |
| LOC netos | N |
| Test LOC (insertions) | N |
| Test LOC ratio | N% |
| Días activos | N |
| Sesiones detectadas | N |
| Avg LOC/hora-sesión | N |

Luego **leaderboard por autor**:

```
Contribuidor         Commits   +/-          Top área
Tú (nombre)              32   +2400/-300   src/features/
alice                    12   +800/-150    src/shared/
bob                       3   +120/-40     tests/
```

### Paso 3: Distribución Horaria

Histograma por hora:

```
Hora  Commits  ████████████████
 09:    4      ████
 14:    8      ████████
 22:    5      █████
```

Identificar y llamar:
- Horas pico
- Zonas muertas
- Patrón bimodal (mañana/tarde) vs continuo
- Clusters de coding nocturno (después de 10pm)

### Paso 4: Detección de Sesiones

Detectar sesiones usando **gap de 45 minutos** entre commits consecutivos.

Clasificar:
- **Sesiones profundas** (50+ min)
- **Sesiones medias** (20-50 min)
- **Micro sesiones** (<20 min, single-commit fire-and-forget)

Calcular:
- Tiempo total de coding activo
- Duración promedio de sesión
- LOC por hora de tiempo activo

### Paso 5: Breakdown por Tipo de Commit

Categorizar por prefijo conventional commit (feat/fix/refactor/test/chore/docs):

```
feat:     20  (40%)  ████████████████████
fix:      27  (54%)  ███████████████████████████
refactor:  2  ( 4%)  ██
```

**Flag** si fix ratio supera 50% — señal de "ship fast, fix fast" que puede indicar gaps de review.

### Paso 6: Hotspot Analysis

Top 10 archivos más cambiados. Flag:
- Archivos cambiados 5+ veces (churn hotspots)
- Archivos de test vs producción en la lista
- CHANGELOG frequency (indicador de disciplina)

### Paso 7: Distribución de Tamaño de PR

Estimar tamaños y bucket:
- **Small** (<100 LOC)
- **Medium** (100-500 LOC)
- **Large** (500-1500 LOC)
- **XL** (1500+ LOC) — flag con conteo de archivos

### Paso 8: Focus Score + Ship of the Week

**Focus score:** % de commits tocando el top-level directory más cambiado. Mayor = trabajo profundo. Menor = context-switching.

**Ship of the week:** Auto-identificar el PR más grande de la ventana. Destacar qué es y por qué importa.

### Paso 9: Análisis por Persona

Para cada contribuidor, computar:

1. **Commits y LOC** — total, insertions, deletions, net
2. **Áreas de focus** — top 3 directorios/archivos
3. **Mix de tipos** — feat/fix/refactor/test personal
4. **Patrones de sesión** — horas pico, cantidad de sesiones
5. **Disciplina de tests** — test LOC ratio personal
6. **Biggest ship** — su commit/PR de mayor impacto

**Para el usuario actual ("Tú"):** Tratamiento más profundo. Incluir todo el detalle de sesiones, patrones, focus. Frame en primera persona.

**Para cada compañero:**
- **Praise** (1-2 cosas específicas): Anclar en commits reales. No "buen trabajo" genérico.
- **Oportunidad de crecimiento** (1 cosa específica): Frame como inversión, no crítica.

**Si solo hay un contribuidor:** Saltar el team breakdown.

**Co-Authored-By:** Parsear trailers. Notar autores IA (e.g., `noreply@anthropic.com`) como métrica separada "commits asistidos por IA".

### Paso 10: Tendencias Semana-a-Semana (si ventana >= 14d)

Split en buckets semanales:
- Commits por semana (total y per-author)
- LOC por semana
- Test ratio por semana
- Fix ratio por semana

### Paso 11: Streak Tracking

Contar días consecutivos con al menos 1 commit en origin/main:

```bash
# Team streak
git log origin/main --format="%ad" --date=format:"%Y-%m-%d" | sort -u

# Personal streak
git log origin/main --author="<user_name>" --format="%ad" --date=format:"%Y-%m-%d" | sort -u
```

Contar hacia atrás desde hoy.

### Paso 12: Cargar Historia y Comparar

```bash
ls -t .context/retros/*.json 2>/dev/null
```

**Si hay retros anteriores:** Cargar el más reciente. Calcular deltas:

```
                    Anterior    Ahora       Delta
Test ratio:         22%    →    41%         ↑19pp
Sesiones:           10     →    14          ↑4
LOC/hora:           200    →    350         ↑75%
Fix ratio:          54%    →    30%         ↓24pp (mejorando)
```

**Si no hay retros:** "Primera retro registrada — ejecuta de nuevo la próxima semana para ver tendencias."

### Paso 13: Guardar Snapshot

```bash
mkdir -p .context/retros
```

Guardar JSON con schema:

```json
{
  "date": "YYYY-MM-DD",
  "window": "7d",
  "metrics": {
    "commits": 47,
    "contributors": 3,
    "prs_merged": 12,
    "insertions": 3200,
    "deletions": 800,
    "net_loc": 2400,
    "test_loc": 1300,
    "test_ratio": 0.41,
    "active_days": 6,
    "sessions": 14,
    "deep_sessions": 5,
    "avg_session_minutes": 42,
    "loc_per_session_hour": 350,
    "feat_pct": 0.40,
    "fix_pct": 0.30,
    "peak_hour": 22,
    "ai_assisted_commits": 32
  },
  "authors": {},
  "streak_days": 47,
  "tweetable": "Semana de Mar 1: 47 commits (3 contributors), 3.2k LOC, 38% tests, 12 PRs"
}
```

### Paso 14: Narrativa

**Estructura del output:**

---

**Resumen tweetable** (primera línea):
```
Semana de [fecha]: N commits (N contribuidores), N.Nk LOC, N% tests, N PRs | Racha: Nd
```

## Retro de Ingeniería: [rango de fechas]

### Tabla de Resumen
(del Paso 2)

### Tendencias vs Retro Anterior
(del Paso 12 — saltar si es primera retro)

### Patrones de Tiempo y Sesión
(de Pasos 3-4)

### Velocidad de Shipping
(de Pasos 5-7)

### Señales de Calidad
- Test LOC ratio
- Hotspot analysis
- PRs XL que debieron dividirse

### Focus y Highlights
(del Paso 8)

### Tu Semana (deep-dive personal)
(del Paso 9, solo para el usuario actual)

### Team Breakdown
(del Paso 9, para cada compañero — saltar si es repo solo)

### Top 3 Victorias del Equipo

### 3 Cosas a Mejorar

### 3 Hábitos para la Próxima Semana

---

## Modo Compare

Cuando `/retro compare`:
1. Computar métricas de ventana actual con `--since`
2. Computar métricas de ventana anterior con `--since` y `--until`
3. Tabla side-by-side con deltas y flechas
4. Narrativa de mejoras y regresiones

## Tono

- Alentador pero sincero, sin condescendencia
- Específico y concreto — siempre anclar en commits reales
- Saltar praise genérico ("gran trabajo!") — decir exactamente qué fue bueno
- Frame mejoras como leveling up, no como crítica
- ~3000-4500 palabras total
- Markdown tables y code blocks para data, prosa para narrativa
- Output directo a conversación — NO escribir a filesystem (excepto `.context/retros/` JSON)

## Reglas Importantes

- TODO el output narrativo va directo al usuario. El ÚNICO archivo escrito es el JSON de `.context/retros/`
- Usar `origin/main` para todas las queries git
- Si la ventana tiene zero commits, decirlo y sugerir ventana diferente
- Redondear LOC/hora al 50 más cercano
- No leer CLAUDE.md ni otros docs — este skill es autocontenido

## Siguiente Paso Sugerido

```
📊 Retrospectiva completada.

Próximos pasos recomendados:

→ /retro compare    — Comparar con la semana anterior
→ /metas            — OKRs alineados a los patterns encontrados
→ /kanban           — Tablero para trackear las mejoras identificadas
→ /despachar        — Ship la siguiente feature
```
