-- Generado por Oracle SQL Developer Data Modeler 24.3.1.351.0831
--   en:        2025-09-14 17:48:54 CLST
--   sitio:      Oracle Database 11g
--   tipo:      Oracle Database 11g



-- predefined type, no DDL - MDSYS.SDO_GEOMETRY

-- predefined type, no DDL - XMLTYPE

CREATE TABLE Anuncio_furgon 
    ( 
     ID_Anuncio       VARCHAR2 (10)  NOT NULL , 
     Nombre           VARCHAR2 (50)  NOT NULL , 
     Precio           VARCHAR2 (6)  NOT NULL , 
     Colegio          VARCHAR2 (50)  NOT NULL , 
     Comuna           VARCHAR2 (50)  NOT NULL , 
     Conductor_Correo VARCHAR2 (50)  NOT NULL , 
     Apoderado_ID     VARCHAR2 (10)  NOT NULL 
    ) 
;

ALTER TABLE Anuncio_furgon 
    ADD CONSTRAINT Anuncio_furgon_PK PRIMARY KEY ( ID_Anuncio ) ;

CREATE TABLE Apoderado 
    ( 
     Correo VARCHAR2 (50)  NOT NULL , 
     ID     VARCHAR2 (10)  NOT NULL 
    ) 
;

ALTER TABLE Apoderado 
    ADD CONSTRAINT Apoderado_PK PRIMARY KEY ( Correo ) ;

ALTER TABLE Apoderado 
    ADD CONSTRAINT Apoderado_PKv1 UNIQUE ( ID ) ;

CREATE TABLE Conductor 
    ( 
     Correo               VARCHAR2 (50)  NOT NULL , 
     Rut                  VARCHAR2 (50)  NOT NULL , 
     Fecha_nacimiento     DATE  NOT NULL , 
     Edad                 VARCHAR2 (2)  NOT NULL , 
     certificado_SEREMITT BLOB  NOT NULL , 
     Carnet_de_conducior  UNKNOWN 
--  ERROR: Datatype UNKNOWN is not allowed 
                     NOT NULL , 
     Carnet_de_identidad  UNKNOWN 
--  ERROR: Datatype UNKNOWN is not allowed 
                     NOT NULL 
    ) 
;

ALTER TABLE Conductor 
    ADD CONSTRAINT Conductor_PK PRIMARY KEY ( Correo ) ;

CREATE TABLE Hijo 
    ( 
     Rut                 VARCHAR2 (15)  NOT NULL , 
     Nombres             VARCHAR2 (50)  NOT NULL , 
     Apellidos           VARCHAR2 
--  ERROR: VARCHAR2 size not specified 
                     NOT NULL , 
     Fecha_de_nacimiento DATE  NOT NULL , 
     Edad                VARCHAR2 (2)  NOT NULL , 
     Ficha_medica        BLOB , 
     Apoderado_ID        VARCHAR2 (10)  NOT NULL 
    ) 
;

ALTER TABLE Hijo 
    ADD CONSTRAINT Hijo_PK PRIMARY KEY ( Rut ) ;

CREATE TABLE Historial_de_viajes 
    ( 
     ID               VARCHAR2 (10)  NOT NULL , 
     Fecha            DATE  NOT NULL , 
     Hora             DATE  NOT NULL , 
     Recorrido        UNKNOWN 
--  ERROR: Datatype UNKNOWN is not allowed 
                     NOT NULL , 
     Hijo_Rut         VARCHAR2 (15)  NOT NULL , 
     Conductor_Correo VARCHAR2 (50)  NOT NULL 
    ) 
;

ALTER TABLE Historial_de_viajes 
    ADD CONSTRAINT Historial_de_viajes_PK PRIMARY KEY ( ID ) ;

CREATE TABLE Tutor 
    ( 
     Rut              VARCHAR2 (15)  NOT NULL , 
     Nombres          VARCHAR2 (50)  NOT NULL , 
     Apellido         VARCHAR2 
--  ERROR: VARCHAR2 size not specified 
                     NOT NULL , 
     Edad             VARCHAR2 (2)  NOT NULL , 
     Fecha_nacimiento DATE  NOT NULL , 
     Carnet_Identidad BLOB  NOT NULL , 
     Apoderado_ID     VARCHAR2 (10)  NOT NULL 
    ) 
;

ALTER TABLE Tutor 
    ADD CONSTRAINT Tutor_PK PRIMARY KEY ( Rut ) ;

CREATE TABLE Usuario 
    ( 
     Correo     VARCHAR2 (50)  NOT NULL , 
     Nombre     VARCHAR2 (50)  NOT NULL , 
     Apellidos  VARCHAR2 (50)  NOT NULL , 
     Contraseña VARCHAR2 (15)  NOT NULL , 
     Conductor  BLOB  NOT NULL 
    ) 
;

ALTER TABLE Usuario 
    ADD CONSTRAINT Usuario_PK PRIMARY KEY ( Correo ) ;

CREATE TABLE Vehiculo 
    ( 
     Patente          VARCHAR2 (6)  NOT NULL , 
     Modelo           VARCHAR2 (30)  NOT NULL , 
     Año              VARCHAR2 (4)  NOT NULL , 
     Foto             BLOB  NOT NULL , 
     Conductor_Correo VARCHAR2 (50)  NOT NULL 
    ) 
;

ALTER TABLE Vehiculo 
    ADD CONSTRAINT Vehiculo_PK PRIMARY KEY ( Patente ) ;

ALTER TABLE Anuncio_furgon 
    ADD CONSTRAINT Anuncio_furgon_Apoderado_FK FOREIGN KEY 
    ( 
     Apoderado_ID
    ) 
    REFERENCES Apoderado 
    ( 
     ID
    ) 
;

ALTER TABLE Anuncio_furgon 
    ADD CONSTRAINT Anuncio_furgon_Conductor_FK FOREIGN KEY 
    ( 
     Conductor_Correo
    ) 
    REFERENCES Conductor 
    ( 
     Correo
    ) 
;

ALTER TABLE Apoderado 
    ADD CONSTRAINT Apoderado_Usuario_FK FOREIGN KEY 
    ( 
     Correo
    ) 
    REFERENCES Usuario 
    ( 
     Correo
    ) 
;

ALTER TABLE Conductor 
    ADD CONSTRAINT Conductor_Usuario_FK FOREIGN KEY 
    ( 
     Correo
    ) 
    REFERENCES Usuario 
    ( 
     Correo
    ) 
;

ALTER TABLE Hijo 
    ADD CONSTRAINT Hijo_Apoderado_FK FOREIGN KEY 
    ( 
     Apoderado_ID
    ) 
    REFERENCES Apoderado 
    ( 
     ID
    ) 
;

--  ERROR: FK name length exceeds maximum allowed length(30) 
ALTER TABLE Historial_de_viajes 
    ADD CONSTRAINT Historial_de_viajes_Conductor_FK FOREIGN KEY 
    ( 
     Conductor_Correo
    ) 
    REFERENCES Conductor 
    ( 
     Correo
    ) 
;

ALTER TABLE Historial_de_viajes 
    ADD CONSTRAINT Historial_de_viajes_Hijo_FK FOREIGN KEY 
    ( 
     Hijo_Rut
    ) 
    REFERENCES Hijo 
    ( 
     Rut
    ) 
;

ALTER TABLE Tutor 
    ADD CONSTRAINT Tutor_Apoderado_FK FOREIGN KEY 
    ( 
     Apoderado_ID
    ) 
    REFERENCES Apoderado 
    ( 
     ID
    ) 
;

ALTER TABLE Vehiculo 
    ADD CONSTRAINT Vehiculo_Conductor_FK FOREIGN KEY 
    ( 
     Conductor_Correo
    ) 
    REFERENCES Conductor 
    ( 
     Correo
    ) 
;

--  ERROR: No Discriminator Column found in Arc FKArc_3 - constraint trigger for Arc cannot be generated 

--  ERROR: No Discriminator Column found in Arc FKArc_3 - constraint trigger for Arc cannot be generated



-- Informe de Resumen de Oracle SQL Developer Data Modeler: 
-- 
-- CREATE TABLE                             8
-- CREATE INDEX                             0
-- ALTER TABLE                             18
-- CREATE VIEW                              0
-- ALTER VIEW                               0
-- CREATE PACKAGE                           0
-- CREATE PACKAGE BODY                      0
-- CREATE PROCEDURE                         0
-- CREATE FUNCTION                          0
-- CREATE TRIGGER                           0
-- ALTER TRIGGER                            0
-- CREATE COLLECTION TYPE                   0
-- CREATE STRUCTURED TYPE                   0
-- CREATE STRUCTURED TYPE BODY              0
-- CREATE CLUSTER                           0
-- CREATE CONTEXT                           0
-- CREATE DATABASE                          0
-- CREATE DIMENSION                         0
-- CREATE DIRECTORY                         0
-- CREATE DISK GROUP                        0
-- CREATE ROLE                              0
-- CREATE ROLLBACK SEGMENT                  0
-- CREATE SEQUENCE                          0
-- CREATE MATERIALIZED VIEW                 0
-- CREATE MATERIALIZED VIEW LOG             0
-- CREATE SYNONYM                           0
-- CREATE TABLESPACE                        0
-- CREATE USER                              0
-- 
-- DROP TABLESPACE                          0
-- DROP DATABASE                            0
-- 
-- REDACTION POLICY                         0
-- 
-- ORDS DROP SCHEMA                         0
-- ORDS ENABLE SCHEMA                       0
-- ORDS ENABLE OBJECT                       0
-- 
-- ERRORS                                   8
-- WARNINGS                                 0
