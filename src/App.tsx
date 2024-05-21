/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from 'react';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './screens/HomeScreen';
import RegisterScreen from './screens/RegisterScreen';
import SignInScreen from './screens/SignInScreen'
import OHomeScreen from './screens/OHomeScreen'





function App(): React.JSX.Element {
  
  const Stack = createNativeStackNavigator();

  return (

    <NavigationContainer>
      <Stack.Navigator initialRouteName='Home'>
        <Stack.Screen name="Home" component = {HomeScreen} />
        <Stack.Screen name="Ana Sayfa" component={OHomeScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="Sign In"  component ={SignInScreen} />
      </Stack.Navigator>
    </NavigationContainer>

  );
};





export default App;
