# /lanzamiento — Go-to-Market Strategy

> *"La espada sale de la forja al campo de batalla. Sin estrategia de lanzamiento, hasta el mejor producto muere en la oscuridad."*

Genera una estrategia Go-to-Market completa: segmento beachhead, ICP, canales,
messaging, growth loops, y plan de lanzamiento.

## Instrucciones

### Paso 1: Recopilar Contexto

Buscar información en el proyecto:
1. `BMC-*.md` o `LEAN-CANVAS-*.md` → Segmentos, canales, propuesta de valor
2. `STRATEGY-CANVAS-*.md` → Visión, competitive advantage
3. `COMPETITIVE-ANALYSIS-*.md` → Battlecards, positioning
4. `PRICING-STRATEGY-*.md` → Modelo de monetización
5. `NORTH-STAR-*.md` → Métrica principal
6. `PDR-*.md` → Features core

Si no hay documentos, entrevista:

```
Para diseñar tu estrategia de lanzamiento necesito:

🎯 Producto
1. ¿Qué hace tu producto? (una oración)
2. ¿Para quién es? (segmento específico)
3. ¿Cuál es tu ventaja vs la competencia?

🚀 Lanzamiento
4. ¿Tienes fecha objetivo de lanzamiento?
5. ¿Tienes presupuesto de marketing? ¿Cuánto?
6. ¿Tienes audiencia existente? (newsletter, social, comunidad)

📊 Estado actual
7. ¿El producto ya está construido o en desarrollo?
8. ¿Tienes beta users o waitlist?
9. ¿Has validado con usuarios reales?
```

### Paso 2: Identificar Segmento Beachhead

> "Crossing the Chasm" (Geoffrey Moore): No intentes servir a todo el mercado.
> Domina un nicho primero.

**El beachhead es el segmento que:**
- Tiene el dolor más urgente
- Puede adoptar tu producto con mínima fricción
- Puede pagar tu precio
- Puede referir a otros segmentos

```
SEGMENTO BEACHHEAD

Quién: [descripción específica — no "empresas" sino "agencias de marketing de 5-20 personas"]
Dónde están: [comunidades, plataformas, eventos]
Cuántos hay: [tamaño estimado del segmento]
Dolor principal: [el problema que más les duele]
Willingness to pay: [cuánto y por qué]
Por qué primero: [por qué este segmento antes que otros]
```

### Paso 3: Definir ICP (Ideal Customer Profile)

```
IDEAL CUSTOMER PROFILE

Firmográfico:
- Industria: [específico]
- Tamaño: [# empleados o revenue]
- Geografía: [mercados objetivo]

Behavioral:
- Usa actualmente: [herramientas/procesos]
- Busca activamente: [señales de compra]
- Presupuesto: [disponibilidad]

Dolor:
- Problema #1: [el más urgente]
- Impacto: [tiempo/dinero perdido]
- Trigger de compra: [evento que dispara la búsqueda]

Anti-ICP (NO es tu cliente):
- [quién excluir y por qué]
```

### Paso 4: Diseñar GTM Strategy

**A. Seleccionar GTM Motion:**

| Motion | Mejor Para | Señales | CAC típico |
|--------|-----------|---------|-----------|
| **Product-Led Growth (PLG)** | Self-serve, viral potential | El producto demuestra valor solo | Bajo ($0-50) |
| **Sales-Led** | Enterprise, high ACV | Requiere demo/customización | Alto ($500+) |
| **Community-Led** | Developer tools, nicho | Comunidad activa existe | Medio ($50-200) |
| **Content-Led** | Educación, SEO opportunity | Problema buscado en Google | Medio ($100-300) |
| **Partner-Led** | Integraciones, marketplaces | Distribución via plataformas | Variable |

**B. Definir Messaging Framework:**

```
Headline: [Beneficio principal en < 10 palabras]
Subheadline: [Cómo + para quién en 1 oración]
Social proof: [credibilidad — beta users, logos, métricas]

Messaging por dolor:
| Dolor | Mensaje | CTA |
|-------|---------|-----|
| [dolor 1] | "[copy que conecta]" | [acción] |
```

**C. Diseñar Growth Loops:**

Identificar 1-2 loops de crecimiento:

| Tipo | Cómo funciona | Ejemplo |
|------|--------------|---------|
| **Viral** | Uso → Invitación → Nuevo usuario → Uso | Calendly: link compartido = marketing |
| **Content/UGC** | Uso → Contenido generado → SEO → Nuevo usuario | Notion templates |
| **Referral** | Uso → Reward por referir → Nuevo usuario | Dropbox: espacio gratis |
| **Collaboration** | Uso → Invitar compañero → Nuevo usuario | Figma: proyecto compartido |
| **Data** | Uso → Producto mejora → Más valor → Retención | Spotify: recomendaciones |

### Paso 5: Plan de Lanzamiento

```
## Plan de Lanzamiento — [Nombre]

### Pre-Launch (4-2 semanas antes)
- [ ] Landing page con waitlist
- [ ] Email sequence para waitlist (3 emails: story, sneak peek, countdown)
- [ ] Social proof: testimonials de beta users
- [ ] Content: 2-3 artículos/posts sobre el problema (no el producto)
- [ ] Comunidad: participar en [comunidades relevantes]

### Launch Week
- [ ] Día 1: Email a waitlist + social announcement
- [ ] Día 2: Product Hunt / Hacker News (si es tech)
- [ ] Día 3: Partner/influencer mentions
- [ ] Día 4: Case study / demo video
- [ ] Día 5: Special launch offer (annual discount)

### Post-Launch (semanas 1-4)
- [ ] Onboarding optimization basado en primeros usuarios
- [ ] Feedback loop: entrevistar primeros 10 usuarios
- [ ] Content: SEO articles targeting [keywords]
- [ ] Referral program activation
- [ ] Iterate: ajustar messaging basado en lo aprendido
```

### Paso 6: Research con Perplexity (Opcional)

Si el MCP de Perplexity está disponible:

```
🔍 ¿Quieres enriquecer tu GTM con research?

Puedo investigar:
1. Canales que funcionan en tu industria
2. Estrategias de lanzamiento de competidores
3. Comunidades donde está tu ICP
4. Keywords con volumen para content-led growth
```

### Paso 7: Generar Documento

Crear `GTM-STRATEGY-[nombre].md`:

```markdown
# GTM-STRATEGY-[nombre]

> Estrategia Go-to-Market generada por Forge · [fecha]

## Resumen Ejecutivo
[GTM motion, beachhead segment, canal principal, timeline]

## Segmento Beachhead
[Descripción detallada]

## Ideal Customer Profile
[ICP + Anti-ICP]

## GTM Motion
[Motion elegida con justificación]

## Messaging Framework
[Headlines, copy por dolor, social proof]

## Growth Loops
[Loops diseñados con métricas esperadas]

## Plan de Lanzamiento
[Timeline Pre-launch → Launch → Post-launch]

## Métricas de Éxito
| Métrica | Target Mes 1 | Target Mes 3 | Target Mes 6 |
|---------|-------------|-------------|-------------|
| Signups | [X] | [X] | [X] |
| Activación | [X%] | [X%] | [X%] |
| Revenue | $[X] | $[X] | $[X] |
```

## Output

```
GTM-STRATEGY-[nombre].md
```

## Siguiente Paso Sugerido

```
🚀 Estrategia de lanzamiento completada.

Próximos pasos recomendados:

→ /landing    — Crear landing page con el messaging definido
→ /roi        — Proyecciones financieras post-lanzamiento
→ /kanban     — Tablero para trackear el plan de lanzamiento
→ /metas      — OKRs del primer trimestre post-launch
→ /rivales    — Battlecards para el equipo de ventas
```
