import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, Alert, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/firebaseConfig';
import { useSyncRutActivo } from '@/hooks/use-sync-rut-activo';

export default function ListaVehiculosRedirectScreen() {
  const router = useRouter();
  useSyncRutActivo();
  const [estado, setEstado] = useState<'cargando' | 'sinVehiculos'>('cargando');

  useEffect(() => {
    let activo = true;

    const redirigir = async () => {
      try {
        const rutGuardado = await AsyncStorage.getItem('rutUsuario');
        if (!rutGuardado) {
          Alert.alert('Error', 'No se encontró el RUT del usuario activo.');
          if (activo) setEstado('sinVehiculos');
          return;
        }

        const vehiculosRef = collection(db, 'Vehiculos');
        const q = query(vehiculosRef, where('rutUsuario', '==', rutGuardado));
        const snapshot = await getDocs(q);

        if (!activo) return;

        if (snapshot.empty) {
          setEstado('sinVehiculos');
          return;
        }

        const primerVehiculo = snapshot.docs[0];
        const data = primerVehiculo.data() || {};
        const patente = data.patente || '';

        if (!patente) {
          Alert.alert('Sin patente', 'El vehículo registrado no tiene patente disponible.');
          setEstado('sinVehiculos');
          return;
        }

        router.replace({
          pathname: '/conductor/lista-pasajeros',
          params: {
            patente,
            nombre: data.modelo || 'Furgón',
            colegio: '',
            comuna: '',
            precio: '',
            rutConductor: rutGuardado,
          },
        });
      } catch (error) {
        console.error('Error al redirigir desde Lista_vehiculos_2:', error);
        Alert.alert('Error', 'No se pudo abrir la lista de niños.');
        if (activo) setEstado('sinVehiculos');
      }
    };

    redirigir();

    return () => {
      activo = false;
    };
  }, [router]);

  if (estado === 'cargando') {
    return (
      <View style={styles.feedbackContainer}>
        <ActivityIndicator size="large" color="#127067" />
        <Text style={styles.feedbackText}>Abriendo lista de niños…</Text>
      </View>
    );
  }

  return (
    <View style={styles.feedbackContainer}>
      <Ionicons name="bus-outline" size={64} color="#999" />
      <Text style={styles.feedbackText}>
        No encontramos vehículos registrados para mostrar niños asociados.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  feedbackContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F7F8',
    paddingHorizontal: 24,
  },
  feedbackText: {
    marginTop: 12,
    color: '#666',
    fontSize: 16,
    textAlign: 'center',
  },
});
