import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from 'react-native-vector-icons';
import { TouchableOpacity, View, Text, StyleSheet, Alert } from 'react-native';
import Parse from 'parse/react-native.js'; // Importe o Parse configurado

import Home from '../pages/home';
import Listar from '../pages/listar';
import Gravar from '../pages/gravar';
import { getCurrentPositionAsync } from 'expo-location'; // Para obter a localização atual

const Tab = createBottomTabNavigator();

const saveRoute = async (latitude, longitude) => {
  const Route = Parse.Object.extend('Routes'); // Nome da tabela no Back4App
  const route = new Route();

  route.set('latitude', latitude);
  route.set('longitude', longitude);
  route.set('timestamp', new Date());

  try {
    await route.save();
    console.log('Rota salva com sucesso!');
  } catch (error) {
    console.error('Erro ao salvar a rota:', error);
  }
};

const showAlert = async () => {
  // Obter localização atual
  let { status } = await getCurrentPositionAsync();
  if (status !== 'granted') {
    Alert.alert('Permissão de localização necessária!');
    return;
  }

  const { coords } = await getCurrentPositionAsync();
  const { latitude, longitude } = coords;

  // Exibir alerta de confirmação
  Alert.alert(
    "Gravar Rota",
    "Você deseja gravar sua rota atual?",
    [
      {
        text: "Não",
        style: "cancel"
      },
      {
        text: "Sim",
        onPress: () => saveRoute(latitude, longitude) // Salvar a rota
      }
    ],
    { cancelable: false }
  );
};

const CustomTabBar = ({ state, descriptors, navigation }) => {
  const { routes, index } = state;

  return (
    <View style={styles.tabBar}>
      {routes.map((route, i) => {
        const { options } = descriptors[route.key];
        const label =
          options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
            ? options.title
            : route.name;

        const isFocused = index === i;
        const isCenterButton = route.name === 'Gravar';

        return isCenterButton ? (
          <TouchableOpacity
            key={route.key}
            style={styles.centerButton}
            onPress={() => showAlert()}
          >
            <Ionicons name="recording" size={24} color="#fff" />
            <Text style={styles.centerButtonText}>Gravar</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            key={route.key}
            onPress={() => navigation.navigate(route.name)}
            style={[styles.tabButton, isFocused && styles.focusedButton]}
          >
            <Ionicons
              name={i === 0 ? 'home' : 'list'}
              size={24}
              color={isFocused ? '#673ab7' : '#222'}
            />
            <Text style={{ color: isFocused ? '#673ab7' : '#222' }}>
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export default function Routes() {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Home"
        component={Home}
        options={{
          tabBarLabel: 'Home',
        }}
      />
      <Tab.Screen
        name="Gravar"
        component={Gravar}
        options={{
          tabBarLabel: 'Gravar',
          tabBarButton: () => null,
        }}
      />
      <Tab.Screen
        name="Listar"
        component={Listar}
        options={{
          tabBarLabel: 'Listar',
          tabBarStyle: { display: 'none' },
        }}
      />
      
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    height: 60,
    backgroundColor: '#fff',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerButton: {
    backgroundColor: '#673ab7',
    borderRadius: 30,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    height: 60,
    width: 70,
    bottom: 15,
  },
  centerButtonText: {
    color: '#fff',
    marginTop: 5,
  },
  focusedButton: {
    borderBottomColor: '#673ab7',
    borderBottomWidth: 2,
  },
});
