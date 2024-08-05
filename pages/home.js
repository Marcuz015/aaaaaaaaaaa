import React, { useEffect, useState } from 'react';
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps'; // Inclui o provedor do Google Maps se necessário
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import * as Location from 'expo-location';

export default function home() {
  const [region, setRegion] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        alert('Permission to access location was denied');
        setLoading(false);
        return;
      }

      let location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      setRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });

      setLoading(false);
    })();
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {region && (
        <MapView
          style={styles.map}
          provider={PROVIDER_GOOGLE} 
          region={region}
          showsUserLocation={true} 
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff', 
    justifyContent: 'center', 
    alignItems: 'center', 
  },
  map: {
    flex: 1,
    width: '100%',
  },
});
