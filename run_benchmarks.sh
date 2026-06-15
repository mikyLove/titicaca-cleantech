#!/usr/bin/env bash
# =============================================================================
# run_benchmarks.sh
# Pruebas de carga automatizadas con Apache Bench (ab)
# Objetivo: https://titicaca-cleantech.vercel.app/
# =============================================================================

set -euo pipefail

BASE_URL="https://titicaca-cleantech.vercel.app"
RESULTS_DIR="results_data"
LOGIN_ENDPOINT="${BASE_URL}/login"
TIMESTAMP=$(date "+%Y%m%d_%H%M%S")
SUMMARY_FILE="${RESULTS_DIR}/summary_${TIMESTAMP}.txt"

# Colores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
RED='\033[0;31m'
NC='\033[0m' # Sin color

banner() {
    echo -e "${CYAN}"
    echo "============================================"
    echo "   TITICACA CLEANTECH - LOAD TEST SUITE"
    echo "   $(date)"
    echo "============================================"
    echo -e "${NC}"
}

info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

header() {
    echo -e "\n${CYAN}========== $1 ==========${NC}\n"
}

check_dependencies() {
    if ! command -v ab &>/dev/null; then
        error "Apache Bench (ab) no está instalado."
        echo "Instálalo con: sudo apt update && sudo apt install -y apache2-utils"
        exit 1
    fi
    info "Apache Bench $(ab --version | head -1) encontrado."
}

setup_directories() {
    mkdir -p "$RESULTS_DIR"
    info "Directorio '${RESULTS_DIR}' listo."
}

create_post_data() {
    local file="$1"
    cat > "$file" <<-EOF
{
    "username": "test_user@titicaca.com",
    "password": "TestPass123!"
}
EOF
    info "Archivo de datos POST creado: ${file}"
}

run_test() {
    local scenario="$1"
    local description="$2"
    local output_file="${RESULTS_DIR}/escenario${scenario}.txt"
    shift 2

    echo -e "${YELLOW}----------------------------------------------------------------------${NC}"
    echo -e "${YELLOW}  Escenario ${scenario}: ${description}${NC}"
    echo -e "${YELLOW}  Comando: ab -g ${output_file} $@${NC}"
    echo -e "${YELLOW}----------------------------------------------------------------------${NC}"

    if ab -g "$output_file" "$@" 2>&1; then
        echo ""
        info "Escenario ${scenario} completado. Resultados en: ${output_file}"
    else
        local exit_code=$?
        warn "Escenario ${scenario} finalizó con código ${exit_code} (posible timeout o error de red)."
    fi
    echo ""
}

summarize() {
    local file="${RESULTS_DIR}/escenario${1}.txt"
    local label="$2"
    {
        echo "=== ${label} ==="
        awk '
        /^Server Software/   { print $0 }
        /^Server Hostname/   { print $0 }
        /^Document Path/     { print $0 }
        /^Document Length/   { print $0 }
        /^Concurrency Level/ { print $0 }
        /^Time taken for tests/ { print $0 }
        /^Complete requests/ { print $0 }
        /^Failed requests/   { print $0 }
        /^Total transferred/ { print $0 }
        /^Requests per second/ { print $0 }
        /^Time per request/  { print $0 }
        /^Transfer rate/     { print $0 }
        ' "${RESULTS_DIR}/escenario${1}.log" 2>/dev/null
    } >> "$SUMMARY_FILE"
}

# =============================================================================
# INICIO
# =============================================================================

banner
check_dependencies
setup_directories

POST_DATA="${RESULTS_DIR}/login_payload.json"
create_post_data "$POST_DATA"

# -----------------------------------------------------------------------------
# Escenario 1: Línea base (1 usuario, 1 solicitud)
# -----------------------------------------------------------------------------
header "ESCENARIO 1: LÍNEA BASE"
info "1 usuario concurrente, 1 solicitud única."
info "Propósito: Medir latencia mínima sin contención."
run_test 1 "1 usuario concurrente - Línea base" \
    -n 1 -c 1 \
    -H "Accept: text/html,application/json" \
    "${BASE_URL}/" 2>&1 | tee "${RESULTS_DIR}/escenario1.log"

# -----------------------------------------------------------------------------
# Escenario 2: Carga baja (10 usuarios, 30 segundos)
# -----------------------------------------------------------------------------
header "ESCENARIO 2: CARGA BAJA SOSTENIDA"
info "10 usuarios concurrentes durante 30 segundos."
info "Propósito: Validar comportamiento con tráfico ligero típico."
run_test 2 "10 usuarios concurrentes - 30s" \
    -t 30 -n 100000 -c 10 \
    -H "Accept: text/html,application/json" \
    "${BASE_URL}/" 2>&1 | tee "${RESULTS_DIR}/escenario2.log"

# -----------------------------------------------------------------------------
# Escenario 3: Carga media (50 usuarios, 1000 solicitudes)
# -----------------------------------------------------------------------------
header "ESCENARIO 3: CARGA MEDIA"
info "50 usuarios concurrentes, 1000 solicitudes totales."
info "Propósito: Detectar degradación incipiente bajo concurrencia moderada."
run_test 3 "50 usuarios concurrentes - 1000 solicitudes" \
    -n 1000 -c 50 \
    -H "Accept: text/html,application/json" \
    "${BASE_URL}/" 2>&1 | tee "${RESULTS_DIR}/escenario3.log"

# -----------------------------------------------------------------------------
# Escenario 4: Pico (200 usuarios, 30 segundos)
# -----------------------------------------------------------------------------
header "ESCENARIO 4: PICO DE TRÁFICO"
info "200 usuarios concurrentes durante 30 segundos."
info "Propósito: Simular un pico alto de tráfico simultáneo."
run_test 4 "200 usuarios concurrentes - Pico 30s" \
    -t 30 -n 100000 -c 200 \
    -H "Accept: text/html,application/json" \
    "${BASE_URL}/" 2>&1 | tee "${RESULTS_DIR}/escenario4.log"

# -----------------------------------------------------------------------------
# Escenario 5: Login POST (30 usuarios, 300 solicitudes)
# -----------------------------------------------------------------------------
header "ESCENARIO 5: LOGIN POST"
info "30 usuarios concurrentes haciendo POST a /login (300 solicitudes)."
info "Propósito: Probar el endpoint de autenticación bajo carga."
run_test 5 "POST /login - 30 usuarios concurrentes" \
    -n 300 -c 30 \
    -p "$POST_DATA" \
    -T "application/json" \
    -H "Accept: application/json" \
    "${LOGIN_ENDPOINT}" 2>&1 | tee "${RESULTS_DIR}/escenario5.log"

# -----------------------------------------------------------------------------
# Escenario 6: Carga alta sostenida (100 usuarios, 60 segundos)
# -----------------------------------------------------------------------------
header "ESCENARIO 6: CARGA ALTA SOSTENIDA"
info "100 usuarios concurrentes durante 60 segundos."
info "Propósito: Evaluar estabilidad del servidor con carga alta prolongada."
run_test 6 "100 usuarios concurrentes - 60s sostenido" \
    -t 60 -n 200000 -c 100 \
    -H "Accept: text/html,application/json" \
    "${BASE_URL}/" 2>&1 | tee "${RESULTS_DIR}/escenario6.log"

# -----------------------------------------------------------------------------
# Escenario 7: Estrés (500 usuarios, 30 segundos)
# -----------------------------------------------------------------------------
header "ESCENARIO 7: PRUEBA DE ESTRÉS"
info "500 usuarios concurrentes durante 30 segundos."
info "Propósito: Llevar el servidor al límite y observar punto de quiebre."
run_test 7 "500 usuarios concurrentes - Estrés 30s" \
    -t 30 -n 200000 -c 500 \
    -H "Accept: text/html,application/json" \
    "${BASE_URL}/" 2>&1 | tee "${RESULTS_DIR}/escenario7.log"

# -----------------------------------------------------------------------------
# Escenario 8: Resistencia (75 usuarios, 2 minutos)
# -----------------------------------------------------------------------------
header "ESCENARIO 8: PRUEBA DE RESISTENCIA"
info "75 usuarios concurrentes durante 120 segundos."
info "Propósito: Detectar memory leaks o degradación progresiva."
run_test 8 "75 usuarios concurrentes - Resistencia 120s" \
    -t 120 -n 500000 -c 75 \
    -H "Accept: text/html,application/json" \
    "${BASE_URL}/" 2>&1 | tee "${RESULTS_DIR}/escenario8.log"

# -----------------------------------------------------------------------------
# Escenario 9: Ráfaga (300 usuarios, 500 solicitudes)
# -----------------------------------------------------------------------------
header "ESCENARIO 9: RÁFAGA (BURST)"
info "300 usuarios concurrentes, 500 solicitudes totales."
info "Propósito: Simular una oleada repentina de tráfico corta e intensa."
run_test 9 "300 usuarios concurrentes - Ráfaga 500 solicitudes" \
    -n 500 -c 300 \
    -H "Accept: text/html,application/json" \
    "${BASE_URL}/" 2>&1 | tee "${RESULTS_DIR}/escenario9.log"

# =============================================================================
# RESUMEN FINAL
# =============================================================================
header "RESUMEN DE RESULTADOS"

{
    echo "============================================"
    echo " RESUMEN DE PRUEBAS DE CARGA"
    echo " Fecha: $(date)"
    echo " URL Base: ${BASE_URL}"
    echo "============================================"
    echo ""
} > "$SUMMARY_FILE"

for i in $(seq 1 9); do
    summarize "$i" "Escenario ${i}"
done

echo ""
info "Resumen guardado en: ${SUMMARY_FILE}"
info "Todos los archivos detallados (-g) están en: ${RESULTS_DIR}/"
echo ""

# Listar archivos generados
ls -lh "${RESULTS_DIR}/" | grep -E 'escenario[0-9]+\.txt'

echo -e "\n${GREEN}✔ Pruebas de carga finalizadas.${NC}"
echo -e "${CYAN}Para graficar los resultados con gnuplot:${NC}"
echo "  gnuplot -e \"plot 'results_data/escenario1.txt' using 2:5 with lines; pause -1\""
