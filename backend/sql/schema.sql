-- MySQL 8 - Turnero Médico (schema + seeds)
SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

CREATE DATABASE IF NOT EXISTS turnosMedicos
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE turnosMedicos;

-- pacientes
CREATE TABLE IF NOT EXISTS pacientes (
  id INT NOT NULL AUTO_INCREMENT,
  dni VARCHAR(8) NOT NULL,
  nombre VARCHAR(45) NULL,
  apellido VARCHAR(45) NULL,
  mail VARCHAR(180) NULL,
  telefono VARCHAR(20) NULL,
  fecha_nacimiento DATE NULL,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_pacientes_dni (dni)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- estado_turno
CREATE TABLE IF NOT EXISTS estado_turno (
  id INT NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(45) NOT NULL,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_estado_turno_nombre (nombre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- especialidades
CREATE TABLE IF NOT EXISTS especialidades (
  id INT NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(45) NOT NULL,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_especialidades_nombre (nombre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- medicos
CREATE TABLE IF NOT EXISTS medicos (
  id INT NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(45) NULL,
  apellido VARCHAR(45) NULL,
  matricula VARCHAR(45) NULL,
  mail VARCHAR(180) NULL,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  especialidad_id INT NOT NULL,
  PRIMARY KEY (id),
  KEY idx_medicos_especialidad (especialidad_id),
  CONSTRAINT fk_medicos_especialidades1
    FOREIGN KEY (especialidad_id) REFERENCES especialidades (id)
    ON DELETE RESTRICT ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- turnos
CREATE TABLE IF NOT EXISTS turnos (
  id INT NOT NULL AUTO_INCREMENT,
  fecha_hora DATETIME NOT NULL,
  duracion_min INT NOT NULL,
  motivo VARCHAR(255) NULL,
  observaciones TEXT NULL,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  estado_turno_id INT NOT NULL,
  medicos_id INT NOT NULL,
  pacientes_id INT NOT NULL,
  PRIMARY KEY (id),
  KEY idx_turnos_fecha_hora (fecha_hora),
  KEY idx_turnos_estado (estado_turno_id),
  KEY idx_turnos_medico (medicos_id),
  KEY idx_turnos_paciente (pacientes_id),
  CONSTRAINT fk_turnos_estado_turno1
    FOREIGN KEY (estado_turno_id) REFERENCES estado_turno (id)
    ON DELETE RESTRICT ON UPDATE NO ACTION,
  CONSTRAINT fk_turnos_medicos1
    FOREIGN KEY (medicos_id) REFERENCES medicos (id)
    ON DELETE RESTRICT ON UPDATE NO ACTION,
  CONSTRAINT fk_turnos_pacientes1
    FOREIGN KEY (pacientes_id) REFERENCES pacientes (id)
    ON DELETE RESTRICT ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- recetas
CREATE TABLE IF NOT EXISTS recetas (
  id INT NOT NULL AUTO_INCREMENT,
  fecha_emision DATE NOT NULL,
  indicaciones TEXT NULL,
  pacientes_id INT NOT NULL,
  turnos_id INT NULL,
  medicos_id INT NOT NULL,
  PRIMARY KEY (id),
  KEY idx_recetas_paciente (pacientes_id),
  KEY idx_recetas_turno (turnos_id),
  KEY idx_recetas_medico (medicos_id),
  CONSTRAINT fk_recetas_pacientes1
    FOREIGN KEY (pacientes_id) REFERENCES pacientes (id)
    ON DELETE RESTRICT ON UPDATE NO ACTION,
  CONSTRAINT fk_recetas_turnos1
    FOREIGN KEY (turnos_id) REFERENCES turnos (id)
    ON DELETE SET NULL ON UPDATE NO ACTION,
  CONSTRAINT fk_recetas_medicos1
    FOREIGN KEY (medicos_id) REFERENCES medicos (id)
    ON DELETE RESTRICT ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- historial_clinico
CREATE TABLE IF NOT EXISTS historial_clinico (
  id INT NOT NULL AUTO_INCREMENT,
  descripcion TEXT NULL,
  fecha_carga DATETIME NULL,
  pacientes_id INT NOT NULL,
  turno_id INT NOT NULL,
  PRIMARY KEY (id),
  KEY idx_historial_paciente (pacientes_id),
  KEY idx_historial_turno (turno_id),
  CONSTRAINT fk_historial_clinico_pacientes1
    FOREIGN KEY (pacientes_id) REFERENCES pacientes (id)
    ON DELETE RESTRICT ON UPDATE NO ACTION,
  CONSTRAINT fk_historial_clinico_turnos1
    FOREIGN KEY (turno_id) REFERENCES turnos (id)
    ON DELETE RESTRICT ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- agenda_medico
CREATE TABLE IF NOT EXISTS agenda_medico (
  id INT NOT NULL AUTO_INCREMENT,
  dia_semana INT NOT NULL,
  hora_inicio TIME NOT NULL,
  hora_fin TIME NOT NULL,
  duracion_min INT NOT NULL,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  medicos_id INT NOT NULL,
  PRIMARY KEY (id),
  KEY idx_agenda_medico (medicos_id),
  CONSTRAINT chk_dia_semana CHECK (dia_semana BETWEEN 0 AND 6),
  CONSTRAINT chk_duracion CHECK (duracion_min > 0),
  CONSTRAINT uk_agenda_slot UNIQUE (medicos_id, dia_semana, hora_inicio),
  CONSTRAINT fk_agenda_medico_medicos1
    FOREIGN KEY (medicos_id) REFERENCES medicos (id)
    ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seeds
INSERT INTO estado_turno (nombre) VALUES
  ('asignado'),('cancelado_medico'),('cancelado_paciente'),('atendido'),('ausente')
ON DUPLICATE KEY UPDATE nombre = VALUES(nombre);

SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
