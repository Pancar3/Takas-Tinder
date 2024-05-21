import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet,Alert } from 'react-native';
import firebase from 'firebase/app';
import auth from '@react-native-firebase/auth';
import { useNavigation } from "@react-navigation/native";

const SignInScreen = ({ a }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const navigation= useNavigation()

  const handleSignIn = () => {
    firebase
      auth()
      .signInWithEmailAndPassword(email, password)
      .then(() => {
        Alert.alert('Başarılı', 'Giriş başarıyla tamamlandı.');
        navigation.navigate('Ana Sayfa');
      })
      .catch(error => {
        Alert.alert('Hata', 'Giriş olma işlemi başarısız oldu: ' + error.message);
      });
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="E-posta"
        onChangeText={text => setEmail(text)}
        value={email}
      />
      <TextInput
        style={styles.input}
        placeholder="Şifre"
        secureTextEntry
        onChangeText={text => setPassword(text)}
        value={password}
      />
      <Button title="Giriş Yap" onPress={handleSignIn} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  input: {
    width: '100%',
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
});

export default SignInScreen;