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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { db } from '@/firebaseConfig';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { useSyncRutActivo } from '@/hooks/use-sync-rut-activo';

interface Hijo {
  id: string;
  nombres: string;
  apellidos: string;
  rut: string;
  edad: number | string;
  fechaNacimiento: string;
}

interface Alerta {
  tipo: string;
  descripcion: string;
  rutaDestino?: string;
  parametros?: Record<string, string>;
  rutDestinatario?: string;
}

export default function PaginaPrincipal() {
  const router = useRouter();
  const [menuVisible, setMenuVisible] = useState(false);
  const [alertasVisible, setAlertasVisible] = useState(false);
  const [rutUsuario, setRutUsuario] = useState<string>('');
  const [hijos, setHijos] = useState<Hijo[]>([]);
  const [hijoSeleccionado, setHijoSeleccionado] = useState<Hijo | null>(null);
  const [loadingHijos, setLoadingHijos] = useState(true);
  const [listaHijosVisible, setListaHijosVisible] = useState(false);
  const [alertas, setAlertas] = useState<Alerta[]>([]);
  useSyncRutActivo();

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const [rutGuardado, rutHijoPrevio] = await Promise.all([
          AsyncStorage.getItem('rutUsuario'),
          AsyncStorage.getItem('rutHijoSeleccionado'),
        ]);
        if (!rutGuardado) {
          Alert.alert('Error', 'No se encontró el RUT del usuario activo.');
          setLoadingHijos(false);
          return;
        }
        setRutUsuario(rutGuardado);

        const hijosRef = collection(db, 'Hijos');
        const q = query(hijosRef, where('rutUsuario', '==', rutGuardado));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const listaHijos: Hijo[] = querySnapshot.docs.map((doc) => {
            const data = doc.data() || {};
            return {
              id: doc.id,
              nombres: data.nombres || 'Sin nombre',
              apellidos: data.apellidos || 'Sin apellido',
              rut: data.rut || 'Sin RUT',
              edad: data.edad !== undefined ? data.edad : '-',
              fechaNacimiento: data.fechaNacimiento || 'No disponible',
            };
          });
          setHijos(listaHijos);
          if (listaHijos.length > 0) {
            const hijoInicial = rutHijoPrevio
              ? listaHijos.find((hijo) => hijo.rut === rutHijoPrevio) ?? listaHijos[0]
              : listaHijos[0];
            setHijoSeleccionado(hijoInicial);
            AsyncStorage.setItem('rutHijoSeleccionado', hijoInicial.rut).catch((error) => {
              console.error('No se pudo guardar el RUT del hijo seleccionado:', error);
            });
          } else {
            AsyncStorage.removeItem('rutHijoSeleccionado').catch((error) => {
              console.error('No se pudo eliminar el RUT del hijo seleccionado:', error);
            });
          }
        }

        // Cargar alertas desde Firebase
        const alertasRef = collection(db, 'Alertas');
        const alertasSnapshot = await getDocs(alertasRef);
        const listaAlertas: Alerta[] = alertasSnapshot.docs
          .map((docSnap) => {
            const data = docSnap.data() || {};
            return {
              tipo: data.tipoAlerta || 'Alerta',
              descripcion: data.descripcion || 'Sin descripción',
              rutaDestino: data.rutaDestino || '',
              parametros: data.parametros || {},
              rutDestinatario: data.rutDestinatario || '',
            };
          })
          .filter((alerta) => !alerta.rutDestinatario || alerta.rutDestinatario === rutGuardado);
        setAlertas(listaAlertas);
      } catch (error) {
        console.error('Error al cargar datos:', error);
        Alert.alert('Error', 'No se pudieron cargar los datos.');
      } finally {
        setLoadingHijos(false);
      }
    };

    cargarDatos();
  }, []);

  const seleccionarHijo = (hijo: Hijo) => {
    setHijoSeleccionado(hijo);
    setListaHijosVisible(false);
    AsyncStorage.setItem('rutHijoSeleccionado', hijo.rut).catch((error) => {
      console.error('No se pudo guardar el RUT del hijo seleccionado:', error);
    });
  };

  return (
    <View style={styles.container}>
      {/* Barra verde superior */}
      <View style={styles.greenHeader}>
        <Pressable onPress={() => setMenuVisible(!menuVisible)} style={styles.iconButton}>
          <Ionicons name="menu" size={28} color="#fff" />
        </Pressable>
        <View style={styles.headerCenter} />
        <Pressable onPress={() => setAlertasVisible(!alertasVisible)} style={styles.iconButton}>
          <Ionicons name="notifications-outline" size={28} color="#fff" />
        </Pressable>
      </View>

      {/* Selector de hijo */}
      <View style={styles.hijoSelectorContainer}>
        <Pressable style={styles.hijoSelector} onPress={() => setListaHijosVisible(!listaHijosVisible)}>
          <Text style={styles.hijoSelectorText}>
            {loadingHijos ? 'Cargando...' :
              hijoSeleccionado ? `${hijoSeleccionado.nombres} ${hijoSeleccionado.apellidos}` :
              'Seleccionar hijo'}
          </Text>
          <Ionicons name="chevron-down" size={20} color="#127067" />
        </Pressable>

        {listaHijosVisible && hijos.length > 0 && (
          <View style={styles.listaHijos}>
            {hijos.map((hijo) => (
              <Pressable
                key={hijo.id}
                style={styles.hijoOption}
                onPress={() => seleccionarHijo(hijo)}
              >
                <Text style={styles.hijoOptionText}>
                  {hijo.nombres} {hijo.apellidos}
                </Text>
              </Pressable>
            ))}
          </View>
        )}
      </View>

      {/* Menú lateral */}
      {menuVisible && (
        <View style={styles.menu}>
          <Link href="/apoderado/perfil-apoderado" asChild>
            <TouchableHighlight underlayColor="#127067" style={styles.menuButton}>
              <Text style={styles.menuButtonText}>Perfil</Text>
            </TouchableHighlight>
          </Link>
          <Link href="/historial-viajes" asChild>
            <TouchableHighlight underlayColor="#127067" style={styles.menuButton}>
              <Text style={styles.menuButtonText}>Historial de viajes</Text>
            </TouchableHighlight>
          </Link>
          <Link href="/apoderado/Listar_furgones" asChild>
            <TouchableHighlight underlayColor="#127067" style={styles.menuButton}>
              <Text style={styles.menuButtonText}>Inscribir Furgon</Text>
            </TouchableHighlight>
          </Link>
          <Link href="/chat-furgon" asChild>
            <TouchableHighlight underlayColor="#127067" style={styles.menuButton}>
              <Text style={styles.menuButtonText}>Chat de furgon</Text>
            </TouchableHighlight>
          </Link>
        </View>
      )}

      {/* Panel de alertas */}
      {alertasVisible && (
        <View style={styles.alertas}>
          <Text style={styles.alertasTitle}>Alertas</Text>
          {alertas.length === 0 ? (
            <Text style={styles.noAlertasText}>No hay alertas nuevas</Text>

          ) : (
            alertas.map((alerta, idx) => (
              <Pressable
                key={idx}
                style={styles.alertaItem}
                onPress={() => {
                  if (alerta.rutaDestino) {
                    router.push({ pathname: alerta.rutaDestino, params: alerta.parametros || {} });
                  }
                }}
              >
                <Ionicons name="alert-circle" size={20} color="#f39c12" />
                <View>
                  <Text style={styles.alertaText}>{alerta.tipo}</Text>
                  <Text style={styles.alertaText}>{alerta.descripcion}</Text>
                </View>
              </Pressable>
            ))
          )}
        </View>
      )}

      {/* Imagen del mapa */}
      <View style={styles.mapaContainer} pointerEvents={listaHijosVisible ? 'none' : 'auto'}>
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
  container: {
    flex: 1,
    backgroundColor: '#F5F7F8',
  },
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
  iconButton: {
    padding: 8,
  },
  headerCenter: {
    flex: 1,
  },
  hijoSelectorContainer: {
    marginTop: 30,
    marginHorizontal: 20,
    zIndex: 100,
    position: 'relative',
    elevation: 12,
  },
  hijoSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#127067',
  },
  hijoSelectorText: {
    fontSize: 16,
    color: '#127067',
    fontWeight: '600',
  },
  listaHijos: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#127067',
    elevation: 16,
    zIndex: 200,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
  },
  hijoOption: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  hijoOptionText: {
    fontSize: 16,
    color: '#333',
  },
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
    width: 180,
    zIndex: 300,
    elevation: 16,
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
    width: 250,
    maxHeight: 200,
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
    alignItems: 'center',
    marginVertical: 4,
  },
  alertaText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#555',
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




