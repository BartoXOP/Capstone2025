import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { addDoc, collection, doc, getDoc, serverTimestamp } from 'firebase/firestore';
import CryptoJS from 'crypto-js';
import * as WebBrowser from 'expo-web-browser';

import { db } from '@/firebaseConfig';
import { useSyncRutActivo } from '@/hooks/use-sync-rut-activo';

interface FichaMedica {
  nombreArchivo?: string;
  contenidoCifrado?: string;
}

interface DatosNino {
  nombres: string;
  apellidos: string;
  colegio: string;
  fichaMedica?: FichaMedica;
  rutApoderado?: string;
}

const ENCRYPTION_SALT = 'RUTA_SEGURA_V1';

export default function DetalleNinoScreen() {
  const router = useRouter();
  useSyncRutActivo();
  const params = useLocalSearchParams();

  const [datosNino, setDatosNino] = useState<DatosNino | null>(null);
  const [loading, setLoading] = useState(true);

  const rutNino = params.rut?.toString() || '';
  const rutApoderadoParam = params.rutApoderado?.toString() || '';
  const rutConductor = params.rutConductor?.toString() || '';

  useEffect(() => {
    const cargarDatos = async () => {
      if (!rutNino) {
        Alert.alert('Error', 'No se recibió el identificador del niño.');
        router.back();
        return;
      }

      try {
        const snapshot = await getDoc(doc(db, 'Hijos', rutNino));
        if (!snapshot.exists()) {
          Alert.alert('Error', 'No se encontró la información del niño.');
          router.back();
          return;
        }

        const data = snapshot.data() || {};
        setDatosNino({
          nombres: data.nombres || 'Sin nombre',
          apellidos: data.apellidos || '',
          colegio: data.colegio || 'Colegio no informado',
          fichaMedica: data.fichaMedica,
          rutApoderado: data.rutUsuario || data.rutApoderado || rutApoderadoParam,
        });
      } catch (error) {
        console.error('Error al cargar la información del niño:', error);
        Alert.alert('Error', 'No se pudo cargar la información del niño.');
        router.back();
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, [rutNino, router, rutApoderadoParam]);

  const manejarDescargarFicha = async () => {
    if (!datosNino?.fichaMedica?.contenidoCifrado) {
      Alert.alert('No disponible', 'Este niño aún no tiene ficha médica asociada.');
      return;
    }

    if (!datosNino.rutApoderado) {
      Alert.alert('Error', 'No se pudo determinar el apoderado asociado.');
      return;
    }

    try {
      const clave = `${datosNino.rutApoderado}-${ENCRYPTION_SALT}`;
      const bytes = CryptoJS.AES.decrypt(datosNino.fichaMedica.contenidoCifrado, clave);
      const base64 = bytes.toString(CryptoJS.enc.Utf8);

      if (!base64) {
        throw new Error('Archivo vacío después de descifrar.');
      }

      const dataUrl = `data:application/pdf;base64,${encodeURIComponent(base64)}`;
      await WebBrowser.openBrowserAsync(dataUrl);
    } catch (error) {
      console.error('Error al descargar la ficha médica:', error);
      Alert.alert('Error', 'No se pudo preparar la ficha médica para su descarga.');
    }
  };

  const manejarContactarApoderado = async () => {
    if (!rutConductor || !datosNino?.rutApoderado || !rutNino) {
      Alert.alert('Error', 'No se dispone de los datos necesarios para abrir el chat.');
      return;
    }

    try {
      await addDoc(collection(db, 'Alertas'), {
        tipoAlerta: 'Emergencia',
        descripcion: `Solicitan hablar sobre ${datosNino.nombres}.`,
        rutDestinatario: datosNino.rutApoderado,
        rutaDestino: '/chat-validacion',
        parametros: {
          rutPadre: datosNino.rutApoderado,
          rutConductor,
          rutHijo: rutNino,
        },
        creadoEn: serverTimestamp(),
        leida: false,
      });
      Alert.alert('Notificacion enviada', 'El apoderado recibira una alerta de emergencia.');
    } catch (error) {
      console.error('Error al registrar la alerta de contacto:', error);
    }

    router.push({
      pathname: '/chat-validacion',
      params: {
        rutPadre: datosNino.rutApoderado,
        rutConductor,
        rutHijo: rutNino,
      },
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color="#127067" />
        <Text style={styles.loadingText}>Cargando información del niño...</Text>
      </View>
    );
  }

  if (!datosNino) {
    return (
      <View style={styles.loadingContainer}>
        <Ionicons name="alert-circle-outline" size={48} color="#999" />
        <Text style={styles.loadingText}>No se pudo mostrar la información del niño.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Pressable style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={28} color="#127067" />
      </Pressable>

      <View style={styles.imageContainer}>
        <Ionicons name="image-outline" size={64} color="#7f8c8d" />
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.name}>{`${datosNino.nombres} ${datosNino.apellidos}`}</Text>
        <Text style={styles.school}>{datosNino.colegio}</Text>
      </View>

      <Pressable style={styles.actionButton} onPress={manejarDescargarFicha}>
        <Text style={styles.actionText}>Descargar ficha médica</Text>
      </Pressable>

      <Pressable style={styles.actionButton} onPress={manejarContactarApoderado}>
        <Text style={styles.actionText}>Contactar Apoderado</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: 80,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    padding: 5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
  },
  loadingText: {
    marginTop: 12,
    color: '#666',
    fontSize: 16,
    textAlign: 'center',
  },
  imageContainer: {
    width: '100%',
    height: 180,
    borderRadius: 12,
    backgroundColor: '#E6EFEF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  infoCard: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#D5E6E4',
    borderRadius: 12,
    padding: 16,
    backgroundColor: '#FFFFFF',
    marginBottom: 24,
    alignItems: 'flex-start',
  },
  name: {
    fontSize: 20,
    fontWeight: '700',
    color: '#127067',
    marginBottom: 4,
  },
  school: {
    fontSize: 16,
    color: '#4F5B5A',
  },
  actionButton: {
    backgroundColor: '#127067',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 24,
    alignItems: 'center',
    width: '100%',
    marginBottom: 16,
  },
  actionText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

