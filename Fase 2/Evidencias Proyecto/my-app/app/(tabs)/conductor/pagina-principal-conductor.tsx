import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableHighlight,
  StyleSheet,
  Pressable,
  Alert,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';
import { db } from '@/firebaseConfig';
import { collection, getDocs, query, where } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSyncRutActivo } from '@/hooks/use-sync-rut-activo';

export default function PaginaPrincipalConductor() {
  const [menuVisible, setMenuVisible] = useState(false);
  const [alertasVisible, setAlertasVisible] = useState(false);
  const [alertas, setAlertas] = useState<any[]>([]);
  useSyncRutActivo();
  const router = useRouter();

  useEffect(() => {
    const cargarAlertas = async () => {
      try {
        const rutConductor = await AsyncStorage.getItem('rutUsuario');
        if (!rutConductor) {
          setAlertas([]);
          return;
        }

        const alertasRef = collection(db, 'Alertas');
        const qAlertas = query(
          alertasRef,
          where('tipoAlerta', '==', 'postulacion'),
          where('rutConductor', '==', rutConductor)
        );
        const snapshot = await getDocs(qAlertas);
        const lista = snapshot.docs
          .map(doc => ({
            id: doc.id,
            descripcion: doc.data().descripcion || 'Sin descripción',
            idPostulacion: doc.data().idPostulacion || null,
            fecha: doc.data().fecha || null,
          }))
          .sort((a, b) => (b.fecha || '').localeCompare(a.fecha || ''))
          .slice(0, 10);
        setAlertas(lista);
      } catch (error) {
        console.error('Error al cargar alertas:', error);
        Alert.alert('Error', 'No se pudieron cargar las alertas.');
      }
    };
    cargarAlertas();
  }, []);

  return (
    <View style={styles.container}>
      {/* Barra superior */}
      <View style={styles.greenHeader}>
        <Pressable onPress={() => setMenuVisible(!menuVisible)} style={styles.iconButton}>
          <Ionicons name="menu" size={28} color="#fff" />
        </Pressable>
        <View style={styles.headerCenter} />
        <Pressable onPress={() => setAlertasVisible(!alertasVisible)} style={styles.iconButton}>
          <Ionicons name="notifications-outline" size={28} color="#fff" />
        </Pressable>
      </View>

      {/* Menú lateral */}
      {menuVisible && (
        <View style={styles.menu}>
          <Link href="/conductor/perfil-conductor" asChild>
            <TouchableHighlight style={styles.menuButton}>
              <Text style={styles.menuButtonText}>Editar perfil</Text>
            </TouchableHighlight>
          </Link>
          <Link href="/historial-viajes" asChild>
            <TouchableHighlight style={styles.menuButton}>
              <Text style={styles.menuButtonText}>Historial de viajes</Text>
            </TouchableHighlight>
          </Link>
          <Link href="/conductor/Lista_vehiculos_2" asChild>
            <TouchableHighlight style={styles.menuButton}>
              <Text style={styles.menuButtonText}>Lista de niños</Text>
            </TouchableHighlight>
          </Link>
          <Link href="/conductor/promocionar-furgon" asChild>
            <TouchableHighlight style={styles.menuButton}>
              <Text style={styles.menuButtonText}>Promocionar Furgón</Text>
            </TouchableHighlight>
          </Link>
          <Link href="/chat-furgon" asChild>
            <TouchableHighlight style={styles.menuButton}>
              <Text style={styles.menuButtonText}>Chat Apoderados</Text>
            </TouchableHighlight>
          </Link>
        </View>
      )}

      {/* Panel de alertas */}
      {alertasVisible && (
        <View style={styles.alertas}>
          <Text style={styles.alertasTitle}>Alertas de Postulación</Text>
          {alertas.length === 0 ? (
            <Text style={styles.noAlertasText}>No hay alertas nuevas</Text>
          ) : (
            alertas.map((alerta, idx) => (
              <Pressable
                key={idx}
                onPress={() =>
                  alerta.idPostulacion &&
                  router.push({
                    pathname: '/chat-validacion',
                    params: { idPostulacion: alerta.idPostulacion },
                  })
                }
              >
                <View style={styles.alertaItem}>
                  <Ionicons name="alert-circle" size={20} color="#f39c12" />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.alertaText}>{alerta.descripcion}</Text>
                    {alerta.fecha && (
                      <Text style={styles.alertaFecha}>
                        {new Date(alerta.fecha).toLocaleString('es-CL', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </Text>
                    )}
                  </View>
                </View>
              </Pressable>
            ))
          )}
        </View>
      )}

      {/* Imagen del mapa */}
      <View style={styles.mapaContainer}>
        <Image
          source={require('@/assets/images/mapa-img.jpg')}
          style={styles.mapaImage}
          resizeMode="cover"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7F8' },
  greenHeader: {
    backgroundColor: '#127067',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 15,
    height: 80,
  },
  iconButton: { padding: 8 },
  headerCenter: { flex: 1 },
  menu: {
    position: 'absolute',
    top: 90,
    left: 16,
    backgroundColor: '#fff',
    paddingVertical: 10,
    paddingHorizontal: 5,
    borderRadius: 8,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    width: 200,
    zIndex: 10,
  },
  menuButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginVertical: 6,
    backgroundColor: '#127067',
    borderRadius: 20,
  },
  menuButtonText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
  alertas: {
    position: 'absolute',
    top: 90,
    right: 16,
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    width: 280,
    maxHeight: 300,
    zIndex: 10,
  },
  alertasTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#127067',
  },
  noAlertasText: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
  },
  alertaItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginVertical: 6,
    gap: 8,
  },
  alertaText: {
    fontSize: 14,
    color: '#555',
  },
  alertaFecha: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  mapaContainer: {
    flex: 1,
    margin: 20,
    marginTop: 20,
    borderRadius: 15,
    overflow: 'hidden',
  },
  mapaImage: {
    width: '100%',
    height: '100%',
    borderRadius: 15,
  },
});
