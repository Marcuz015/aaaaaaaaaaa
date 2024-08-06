import React, { useEffect, useState } from 'react';
import { Alert, TouchableOpacity, View, Text, SafeAreaView, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import Parse from 'parse/react-native.js';
import AsyncStorage from '@react-native-async-storage/async-storage';

import Home from '../pages/home';
import Listar from '../pages/listar';

// Função para inicializar o Parse SDK
const initializeParse = () => {
  Parse.setAsyncStorage(AsyncStorage);
  Parse.initialize('WEsExxhgVdwfPLRGp8wOR2EmnPm1ttDGHpOyQDX2', 'Z6K2jZvYfDJh42y3vxevpPK8BIBJCbTPXn9uuHsM');
  Parse.serverURL = 'https://parseapi.back4app.com/';
};

const Tab = createBottomTabNavigator();

const saveRoute = async (latitude, longitude) => {
  // Função para salvar a rota
  const Route = Parse.Object.extend('Route');
  const route = new Route();
  
  route.set('latitude', latitude);
  route.set('longitude', longitude);

  try {
    await route.save();
    Alert.alert('Sucesso', 'Localização salva com sucesso!');
  } catch (error) {
    Alert.alert('Erro', 'Não foi possível salvar a localização.');
    console.error('Erro ao salvar localização:', error);
  }
};

const fetchRoutes = async () => {
  const query = new Parse.Query('Route');
  try {
    const routes = await query.find();
    return routes.map(route => ({
      id: route.id,
      latitude: route.get('latitude'),
      longitude: route.get('longitude'),
    }));
  } catch (error) {
    console.error('Erro ao buscar rotas:', error);
    return [];
  }
};

const showAlert = async () => {
  let { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') {
    Alert.alert('Permissão de localização necessária!');
    return;
  }

  const { coords } = await Location.getCurrentPositionAsync({});
  const { latitude, longitude } = coords;

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
        onPress: async () => {
          await saveRoute(latitude, longitude);
        }
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
  const [routes, setRoutes] = useState([]);

  useEffect(() => {
    // Inicialize o Parse SDK ao montar o componente
    initializeParse();
    
    const fetchData = async () => {
      const data = await fetchRoutes();
      console.log('Rotas carregadas:', data);
      setRoutes(data);
    };
    fetchData();
  }, []);

  return (
    <SafeAreaView style={{ flex: 1 }}>
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
          component={() => null} // Renderize null para a tela Gravar
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
      <View>
        {routes.map(route => (
          <Text key={route.id}>
            Latitude: {route.latitude}, Longitude: {route.longitude}
          </Text>
        ))}
      </View>
    </SafeAreaView>
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
