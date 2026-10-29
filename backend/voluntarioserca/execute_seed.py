#!/usr/bin/env python3
"""
Script para ejecutar el seed de anuncios en Neon.tech
"""
import os
import sys
import psycopg2

DATABASE_URL = os.environ.get(
    "SPRING_DATASOURCE_URL",
    "postgresql://neondb_owner:npg_u7gnetrJNk2y@ep-restless-base-b609vj1r-pooler.c-2.sa-east-1.aws.neon.tech/neondb?sslmode=require"
)

# Limpiar formato jdbc: si viene de spring datasource
if DATABASE_URL.startswith("jdbc:"):
    DATABASE_URL = DATABASE_URL[5:]

sql_file_path = os.path.join(os.path.dirname(__file__), "seed.sql")

if not os.path.exists(sql_file_path):
    print(f"Error: {sql_file_path} no existe.")
    sys.exit(1)

with open(sql_file_path, "r", encoding="utf-8") as f:
    sql_content = f.read()

try:
    print("Conectando a Neon.tech...")
    conn = psycopg2.connect(DATABASE_URL)
    cur = conn.cursor()

    # Verificar usuario id = 1
    cur.execute("SELECT id, name, email FROM users WHERE id = 1;")
    user = cur.fetchone()
    if not user:
        print("Error: No se encontró el usuario con id = 1 en la base de datos.")
        sys.exit(1)

    print(f"Usuario autor confirmado: ID {user[0]} - {user[1]} ({user[2]})")

    print("Insertando 25 anuncios...")
    cur.execute(sql_content)
    conn.commit()

    cur.execute("SELECT COUNT(*) FROM anuncios WHERE autor_id = 1;")
    total = cur.fetchone()[0]
    print(f"¡Seed ejecutado con éxito! Total de anuncios en la base de datos para el usuario {user[0]}: {total}")

    cur.close()
    conn.close()
except Exception as e:
    print(f"Error al ejecutar el seed: {e}")
    sys.exit(1)
