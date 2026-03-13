FROM apache/airflow:2.8.1

USER root
RUN mkdir -p /opt/airflow/dags \
             /opt/airflow/tasks \
             /opt/airflow/data \
             /opt/airflow/models \
             /opt/airflow/logs \
    && chown -R airflow: /opt/airflow

USER airflow

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY dags/ /opt/airflow/dags/
COPY tasks/ /opt/airflow/tasks/

COPY start.sh /start.sh
USER root
RUN chmod +x /start.sh
USER airflow

ENV AIRFLOW_HOME=/opt/airflow
ENV PYTHONPATH=/opt/airflow

CMD ["/start.sh"]