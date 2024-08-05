// src/config/parseConfig.js
import Parse from 'parse/react-native.js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Inicialize o Parse com suas credenciais do Back4App
Parse.setAsyncStorage(AsyncStorage); // Para usar com AsyncStorage
Parse.initialize('ECENNa0lr9OoHmD9t8b6YBhgOKPvkDfHAQk4BGhM', '9oahuGdnfzqNwDiEtp1xDnpdzhiAELuHNHOHlbp6');
Parse.serverURL = 'https://parseapi.back4app.com/';

export default Parse;
