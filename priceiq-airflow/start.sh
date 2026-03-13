#!/bin/bash
set -e

echo ">>> Initialisation de la base Airflow..."
airflow db migrate

echo ">>> Création de l'utilisateur admin..."
airflow users create \
  --username "${_AIRFLOW_WWW_USER_USERNAME:-admin}" \
  --password "${_AIRFLOW_WWW_USER_PASSWORD:-admin123}" \
  --firstname PriceIQ \
  --lastname Admin \
  --role Admin \
  --email admin@priceiq.com 2>/dev/null || echo "Utilisateur déjà existant, on continue."

echo ">>> Démarrage Airflow standalone..."
exec airflow standalone