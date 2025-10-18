import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableHighlight,
  StyleSheet,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { db } from '@/firebaseConfig';
import { useSyncRutActivo } from '@/hooks/use-sync-rut-activo';
import { addDoc, collection } from 'firebase/firestore';
import { useRouter } from 'expo-router';
import { Picker } from '@react-native-picker/picker';

export default function GenerarAlerta() {
  const [descripcion, setDescripcion] = useState('');
  const [tipoAlerta, setTipoAlerta] = useState('');
  const router = useRouter();
  useSyncRutActivo();

  const guardarAlerta = async () => {
    if (!descripcion || !tipoAlerta) {
      Alert.alert('Error', 'Completa todos los campos.');
      return;
    }

    try {
      await addDoc(collection(db, 'Alertas'), {
        descripcion,
        tipoAlerta,
        fecha: new Date().toISOString(),
      });
      Alert.alert('Éxito', 'Alerta generada correctamente.');
      router.back();
    } catch (error) {
      console.error('Error al guardar alerta:', error);
      Alert.alert('Error', 'No se pudo guardar la alerta.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Generar Alerta</Text>

      <Text style={styles.label}>Descripción</Text>
      <TextInput
        style={styles.input}
        placeholder="Escribe la descripción..."
        value={descripcion}
        onChangeText={setDescripcion}
      />

      <Text style={styles.label}>Tipo de Alerta</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={tipoAlerta}
          onValueChange={(itemValue) => setTipoAlerta(itemValue)}
          style={styles.picker}
        >
          <Picker.Item label="Selecciona un tipo..." value="" />
          <Picker.Item label="Tráfico" value="trafico" />
          <Picker.Item label="Vehicular" value="vehicular" />
          <Picker.Item label="Problemas niño" value="problemas niño" />
          <Picker.Item label="Demora colegio" value="demora colegio" />
        </Picker>
      </View>

      <TouchableHighlight style={styles.button} onPress={guardarAlerta} underlayColor="#0c5c4e">
        <Text style={styles.buttonText}>Guardar Alerta</Text>
      </TouchableHighlight>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7F8',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#127067',
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: '#333',
    marginTop: 10,
  },
  input: {
    backgroundColor: '#fff',
    borderColor: '#127067',
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginTop: 5,
  },
  pickerContainer: {
    backgroundColor: '#fff',
    borderColor: '#127067',
    borderWidth: 1,
    borderRadius: 10,
    marginTop: 5,
  },
  picker: {
    height: 50,
    width: '100%',
    color: '#333',
  },
  button: {
    backgroundColor: '#127067',
    paddingVertical: 14,
    borderRadius: 20,
    marginTop: 30,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
});
