# /graduate — Path de MVP a SaaS

Evalúa tu MVP actual y genera un plan de "graduación" para convertirlo en un SaaS production-ready. Identifica qué falta, prioriza, y genera las PRPs necesarias.

## Instrucciones

### Paso 1: Auditoría del MVP Actual

Analiza el proyecto actual y evalúa cada categoría:

```
📊 Graduation Readiness Assessment
```

| Categoría | Estado | Notas |
|-----------|--------|-------|
| **Auth & Users** | | |
| Email/Password login | ✅/❌ | |
| Roles y permisos (RBAC) | ✅/❌ | |
| MFA / 2FA | ✅/❌ | |
| OAuth providers | ✅/❌ | |
| Profile management | ✅/❌ | |
| **Billing & Payments** | | |
| Stripe integration | ✅/❌ | |
| Subscription plans | ✅/❌ | |
| Free trial flow | ✅/❌ | |
| Invoice/receipt emails | ✅/❌ | |
| Usage-based billing | ✅/❌ | |
| **Multi-tenancy** | | |
| Organization/workspace model | ✅/❌ | |
| Invite system | ✅/❌ | |
| Role-based access per org | ✅/❌ | |
| Data isolation (RLS) | ✅/❌ | |
| **Onboarding** | | |
| Welcome flow | ✅/❌ | |
| Empty states | ✅/❌ | |
| Feature discovery | ✅/❌ | |
| **Monitoring & Ops** | | |
| Error tracking (Sentry) | ✅/❌ | |
| Logging estructurado | ✅/❌ | |
| Health check endpoint | ✅/❌ | |
| Uptime monitoring | ✅/❌ | |
| **Email & Comms** | | |
| Transactional emails (Resend) | ✅/❌ | |
| Email templates | ✅/❌ | |
| Notification system | ✅/❌ | |
| **Analytics** | | |
| Event tracking (PostHog/Mixpanel) | ✅/❌ | |
| Funnel analysis | ✅/❌ | |
| User cohorts | ✅/❌ | |
| **Legal & Compliance** | | |
| Terms of Service | ✅/❌ | |
| Privacy Policy | ✅/❌ | |
| Cookie consent | ✅/❌ | |
| Data export (GDPR) | ✅/❌ | |
| **Security** | | |
| Rate limiting | ✅/❌ | |
| CORS configurado | ✅/❌ | |
| Security headers | ✅/❌ | |
| Input sanitization | ✅/❌ | |
| **Performance** | | |
| Core Web Vitals passing | ✅/❌ | |
| Image optimization | ✅/❌ | |
| Code splitting | ✅/❌ | |
| Caching strategy | ✅/❌ | |

### Paso 2: Graduation Score

Calcula el porcentaje de items completados y asigna un nivel:

| Score | Nivel | Significado |
|-------|-------|-------------|
| 0-25% | 🟤 **Prototype** | Necesita trabajo significativo antes de cobrar |
| 25-50% | 🟠 **MVP** | Funcional pero no listo para usuarios de pago |
| 50-75% | 🟡 **Beta** | Puede aceptar early adopters con disclaimers |
| 75-90% | 🟢 **Launch Ready** | Listo para lanzamiento público |
| 90-100% | 🏆 **Production** | SaaS maduro, listo para escalar |

### Paso 3: Graduation Plan

Genera un plan priorizado en 3 sprints:

```markdown
# GRADUATION-PLAN-[nombre].md

## Sprint 1: Foundation (Must-Have para cobrar)
- [ ] [item más crítico faltante]
- [ ] [siguiente más crítico]
...

## Sprint 2: Trust (Must-Have para retener)
- [ ] [items de confianza/seguridad]
...

## Sprint 3: Scale (Nice-to-Have para crecer)
- [ ] [items de crecimiento]
...
```

### Paso 4: Generar PRPs

Para cada sprint, ofrece generar La Pieza (PRP) automáticamente:

```
¿Quieres que genere La Pieza para el Sprint 1?
Esto creará PRPs individuales para cada item del sprint,
listos para ejecutar con /build.
```

### Paso 5: Research con Perplexity (Opcional)

Si el MCP de Perplexity está disponible, ofrece:

```
🔍 ¿Quieres que investigue la competencia antes de graduar?

Puedo usar Perplexity para:
1. Analizar pricing de competidores directos
2. Investigar features estándar de la industria
3. Identificar tendencias del mercado
4. Validar tu modelo de monetización
```

Si acepta, usa las tools de Perplexity MCP (`chat` o `deep_research`) para research contextual.

## Output

Genera el archivo `GRADUATION-PLAN-[nombre].md` en la raíz del proyecto con:
1. Assessment completo con tabla de estado
2. Graduation Score con nivel
3. Plan de 3 sprints priorizado
4. Timeline estimado
5. Research de competencia (si se usó Perplexity)

## Siguiente Paso Sugerido

```
🎓 Plan de graduación completado.

Próximos pasos recomendados:

→ /build        — Ejecutar Sprint 1 del plan de graduación
→ /kanban       — Crear tablero para trackear el progreso
→ /metas        — OKRs para el trimestre de graduación
→ /lanzamiento  — GTM strategy para el lanzamiento público
→ /roi          — Proyecciones financieras post-graduación
→ /precio       — Diseñar pricing antes de cobrar
```
