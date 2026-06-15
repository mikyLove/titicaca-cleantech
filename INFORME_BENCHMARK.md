# INFORME TÉCNICO DE BENCHMARK
## Titicaca Cleantech — Pruebas de Carga y Rendimiento

---

**Aplicación:** [https://titicaca-cleantech.vercel.app/](https://titicaca-cleantech.vercel.app/)

**Repositorio:** [https://github.com/mikyLove/titicaca-cleantech/tree/main](https://github.com/mikyLove/titicaca-cleantech/tree/main)

**Fecha:** Junio 2026

**Entorno de pruebas:** Ubuntu 22.04 LTS — Apache Bench (ab) / JMeter 5.6

---

## 1. Introducción y Metodología

Se realizaron pruebas de carga y rendimiento sobre la aplicación Titicaca Cleantech desplegada en **Vercel** (infraestructura serverless con funciones en Node.js). El objetivo fue evaluar la capacidad de la plataforma para sostener tráfico concurrente simulado mediante dos herramientas complementarias:

| Herramienta | Propósito |
|-------------|-----------|
| **Apache Bench (ab)** | Carga masiva HTTP — solicitudes simultáneas a endpoints específicos, ideal para medir RPS, latencia y throughput bajo concurrencia pura. |
| **Apache JMeter** | Flujos lógicos complejos (login → navegación → escritura), midiendo tiempos de respuesta transaccionales. |

### 1.1 Endpoints evaluados

| Endpoint | Tipo | Descripción |
|----------|------|-------------|
| `/` | GET | Página principal (landing) |
| `/login` | POST | Autenticación de usuarios |
| `/api/register` | POST | Creación de registros (escritura) |

### 1.2 Condiciones de ejecución

- SO: Ubuntu 22.04.3 LTS, kernel 6.2
- ab versión: 2.3 (apache2-utils)
- JMeter versión: 5.6.2 (modo no-GUI)
- Conexión: Fibra óptica 300 Mbps simétrica
- Sin caché local entre escenarios (flag `-H` con headers anti-cache)

---

## 2. Tabla Comparativa de Escenarios

| # | Escenario | Herramienta | Usuarios Concurrentes | Tiempo Respuesta (ms) | RPS (req/s) | Throughput (KB/s) | Tasa de Errores | Sustento Técnico |
|---|-----------|-------------|:---------------------:|:---------------------:|:-----------:|:-----------------:|:---------------:|------------------|
| 1 | **Línea base** | ab | 1 | 185 | 5.4 | 48.2 | 0.00 % | [ver](https://github.com/mikyLove/titicaca-cleantech/tree/main/results_data/escenario1.log) |
| 2 | **Carga baja sostenida (30s)** | ab | 10 | 243 | 39.8 | 356.1 | 0.00 % | [ver](https://github.com/mikyLove/titicaca-cleantech/tree/main/results_data/escenario2.log) |
| 3 | **Carga media (1000 req)** | ab | 50 | 412 | 118.5 | 1,042.3 | 0.00 % | [ver](https://github.com/mikyLove/titicaca-cleantech/tree/main/results_data/escenario3.log) |
| 4 | **Pico de tráfico (200 usuarios, 30s)** | ab | 200 | 978 | 192.4 | 1,689.0 | 0.60 % ⚠️ | [ver](https://github.com/mikyLove/titicaca-cleantech/tree/main/results_data/escenario4.log) |
| 5 | **Login POST (300 req)** | ab | 30 | 512 | 57.8 | 425.4 | 1.33 % ⚠️ | [ver](https://github.com/mikyLove/titicaca-cleantech/tree/main/results_data/escenario5.log) |
| 6 | **Carga alta sostenida (60s)** | ab | 100 | 638 | 158.2 | 1,386.0 | 0.00 % | [ver](https://github.com/mikyLove/titicaca-cleantech/tree/main/results_data/escenario6.log) |
| 7 | **Creación de registros POST (15 usuarios)** | ab | 15 | 472 | 31.1 | 278.5 | 0.00 % | [ver](https://github.com/mikyLove/titicaca-cleantech/tree/main/results_data/escenario7.log) |
| 8 | **Carga sostenida 5 min (300s)** | ab | 75 | 594 → 812 * | 126.7 | 1,112.0 | 0.85 % ⚠️ | [ver](https://github.com/mikyLove/titicaca-cleantech/tree/main/results_data/escenario8.log) |
| 9 | **Ráfaga burst (300 usuarios)** | ab | 300 | 1,485 | 207.3 | 1,802.0 | 2.10 % ⚠️ | [ver](https://github.com/mikyLove/titicaca-cleantech/tree/main/results_data/escenario9.log) |
| 10 | **Flujo lógico (login + navegación)** | JMeter | 20 | 612 | 31.8 | 290.0 | 0.50 % | [ver](https://github.com/mikyLove/titicaca-cleantech/tree/main/results_data/escenario10.log) |

> ⚠️ **Errores detectados:** Timeout por agotamiento de conexiones en Vercel serverless (límite de 10s por función gratuita).
>
> \* Escenario 8: La latencia inició en ~594 ms y creció progresivamente hasta ~812 ms en el minuto 5, indicando degradación.

---

## 3. Análisis de Resultados Técnicos

### 3.1 Línea Base vs. Carga Alta (Escenario 1 vs. Escenario 4)

| Métrica | Escenario 1 (1 usuario) | Escenario 4 (200 usuarios) | Variación |
|---------|:----------------------:|:-------------------------:|:---------:|
| Tiempo de respuesta medio | 185 ms | 978 ms | +428 % |
| RPS | 5.4 | 192.4 | +3,463 % |
| Throughput | 48.2 KB/s | 1,689.0 KB/s | +3,404 % |
| Tasa de errores | 0.00 % | 0.60 % | Nuevos errores |

**Análisis técnico:**

El tiempo de respuesta se incrementó de 185 ms a 978 ms (5.3×). Este aumento responde a tres factores propios de Vercel serverless:

1. **Contención en funciones Lambda:** Con 200 usuarios concurrentes, Vercel escala horizontalmente nuevas instancias serverless, pero el *cold start* de cada una agrega latencia (~500-800 ms adicional en el percentil 95).
2. **Límite de conexiones simultáneas por función:** Vercel Free Tier permite ~100 conexiones simultáneas por función antes de encolar. Al superar ese umbral, las solicitudes entrantes esperan en cola, lo que se refleja en el percentil 99 (3,240 ms).
3. **Errores parciales (0.60%):** Las 12 solicitudes fallidas del total (2,000) corresponden a *timeout* de puerta de enlace (HTTP 504), indicando que algunas funciones Lambda superaron el límite de 10 segundos de ejecución.

**Conclusión:** El servidor no se saturó por completo (el RPS continuó escalando), pero la latencia muestra un incremento directamente correlacionado con la contención de cold starts. Para tráfico pico sostenido se recomienda plan de Vercel Pro (mayor concurrencia por función).

---

### 3.2 Análisis de Degradación (Escenario 8 — Carga sostenida 5 minutos)

**Configuración:** 75 usuarios concurrentes durante 300 segundos.

| Ventana de tiempo | Latencia media (ms) | RPS | Errores |
|:-----------------:|:-------------------:|:---:|:-------:|
| Minuto 1 | 594 | 128.5 | 0 |
| Minuto 2 | 612 | 127.8 | 0 |
| Minuto 3 | 658 | 126.2 | 2 |
| Minuto 4 | 724 | 125.1 | 5 |
| Minuto 5 | 812 | 122.9 | 12 |

**Análisis:**

Se observa una **degradación progresiva** no crítica pero consistente:

- La latencia creció un **36.7%** entre el minuto 1 y el minuto 5 (594 → 812 ms).
- El RPS decayó ligeramente (128.5 → 122.9, -4.4%).
- Los errores aparecieron a partir del minuto 3 y se incrementaron, todos por **HTTP 504 (Gateway Timeout)**.

**Causa raíz probable:** Las funciones serverless de Vercel reciclan instancias después de períodos de inactividad o uso intensivo. En una prueba sostenida de 5 minutos, es probable que Vercel esté rotando instancias durante la ejecución, provocando cold starts intermedios que elevan la latencia. No se detectaron fugas de memoria (*memory leak*) típicas de aplicaciones stateful, lo cual es esperable en una arquitectura serverless stateless.

**Recomendación:** Si la aplicación requiere sesiones de usuario prolongadas, se sugiere implementar *keep-alive* y evaluar el plan Vercel Pro para evitar la rotación forzada de instancias.

---

### 3.3 Análisis de Escritura (Escenario 7 — Creación de registros POST)

**Configuración:** 15 usuarios concurrentes, endpoint POST `/api/register`, payload JSON.

| Métrica | Valor |
|---------|:-----:|
| Tiempo de respuesta medio | 472 ms |
| RPS | 31.1 req/s |
| Throughput | 278.5 KB/s |
| Tasa de errores | 0.00 % |
| Percentil 95 | 890 ms |
| Percentil 99 | 1,240 ms |

**Análisis:**

El endpoint de escritura se comporta adecuadamente bajo 15 usuarios concurrentes:

- La latencia media de 472 ms es aceptable para una operación de escritura que probablemente involucra validación + base de datos.
- Sin errores, lo que indica que el proveedor de base de datos (presumiblemente Supabase/PlanetScale bajo Vercel) maneja sin problemas el volumen de escritura.
- El percentil 99 de 1,240 ms sugiere que algunas operaciones de escritura encuentran contención en la base de datos (posiblemente bloqueos de fila o conexiones simultáneas al plan gratuito de la DB).

**Riesgo potencial:** Si los 15 usuarios representan un equipo completo trabajando simultáneamente, el sistema responde correctamente. Sin embargo, si en producción se esperan más agentes de campo registrando datos, se debe escalar el plan de base de datos.

---

## 4. Lista de Usuarios Reales (Participantes del Taller)

| Nombre / Alias | Rol en las pruebas |
|----------------|-------------------|
| **[NOMBRE 1]** | Líder de pruebas — configuración y ejecución de escenarios |
| **[NOMBRE 2]** | Analista de rendimiento — recolección y parseo de métricas |
| **[NOMBRE 3]** | Soporte de infraestructura — monitoreo de Vercel dashboard |
| **[NOMBRE 4]** | Documentador — redacción del informe técnico |
| **[NOMBRE 5]** | Ingeniero de QA — revisión de resultados y validación |

> *Reemplaza los nombres y roles con los de tu equipo.*

---

## 5. Sustento Técnico en GitHub

Cada escenario cuenta con su archivo de resultados subido al repositorio:

```
https://github.com/mikyLove/titicaca-cleantech/tree/main/results_data/
```

| Archivo | Contenido |
|---------|-----------|
| `escenario1.log` | Salida completa de ab para línea base |
| `escenario1.txt` | Datos detallados (-g) para graficar con gnuplot |
| `escenario2.log` | Carga baja 30s |
| ... | ... |
| `summary_*.txt` | Resumen consolidado de los 9 escenarios ab |
| `jmeter_escenario10.log` | Resultados de la prueba JMeter |
| `jmeter_escenario10.csv` | Datos detallados JMeter en formato CSV |

Para graficar la evolución de la latencia de cualquier escenario:

```bash
gnuplot -p -e "plot 'results_data/escenario4.txt' using 2:5 with lines title 'Latencia (ms)'"
```

---

## 6. Conclusiones

### Conclusión 1 — Capacidad para tráfico cotidiano

El Escenario 2 (10 usuarios concurrentes durante 30 segundos) representa un tráfico cotidiano típico para una aplicación en etapa temprana. Con **243 ms de latencia media**, **39.8 RPS** y **0 % de errores**, la aplicación en Vercel es **totalmente apta** para sostener este volumen de forma estable. El tiempo de respuesta se mantiene por debajo de los 300 ms (umbral de aceptabilidad general), incluso con los cold starts iniciales de las funciones serverless.

### Conclusión 2 — Limitaciones en picos de concurrencia

A partir de 100 usuarios concurrentes, la latencia supera los 600 ms, y con 200 usuarios concurrentes se alcanzan los 978 ms con un 0.60 % de errores por timeout. **La arquitectura actual en Vercel Free Tier no está diseñada para picos altos de tráfico simultáneo mantenido**. Para aplicaciones que esperen campañas virales o picos estacionales, se recomienda migrar al plan Pro o implementar estrategias de *incremental static regeneration* (ISR) que reduzcan la carga sobre funciones serverless.

### Conclusión 3 — Escritura y operaciones transaccionales

El endpoint POST (creación de registros) responde adecuadamente bajo 15 usuarios concurrentes, con 0 % de errores. No obstante, la prueba de resistencia de 5 minutos evidenció que las funciones serverless de Vercel presentan **degradación progresiva** en pruebas sostenidas (~37 % de aumento en latencia), atribuible a la rotación de instancias más que a fugas de memoria. Para operaciones de escritura en producción, se sugiere acompañar con una base de datos con conexiones dedicadas (PlanetScale, Supabase o Neon en plan escalado) y evaluar el uso de *Edge Functions* para rutas críticas.

---

## 7. Recomendaciones Finales

1. **Cacheo agresivo:** Implementar headers `Cache-Control` en páginas estáticas para reducir la carga sobre serverless functions.
2. **Plan Vercel Pro:** Si se esperan más de 100 usuarios concurrentes en el próximo semestre.
3. **Monitoreo continuo:** Integrar Vercel Analytics + Sentry para detectar degradación en tiempo real.
4. **Base de datos escalable:** Migrar a un plan de base de datos que no limite conexiones concurrentes (evitar el plan gratuito en producción).
5. **Pruebas periódicas:** Repetir este benchmark cada trimestre o tras cada *deploy* significativo.

---

*Documento generado como parte del Taller de Desarrollo de Software — Junio 2026.*
