FROM apache/airflow:2.8.1

# Installe les dépendances métier PriceIQ
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
