-- Script de migración para agregar campos de CV PDF y logo en base64
-- Fecha: 2025-01-03
-- Descripción: Agregar columnas para almacenar CV como PDF y logo como imagen en base64

USE bfp_database;

-- Agregar columna para CV en PDF (base64)
ALTER TABLE candidates
ADD COLUMN cv_pdf_base64 TEXT;

-- Agregar columna para logo/imagen personal (base64)
ALTER TABLE candidates
ADD COLUMN logo_image_base64 TEXT;

-- Verificar que las columnas se agregaron correctamente
DESCRIBE candidates;
