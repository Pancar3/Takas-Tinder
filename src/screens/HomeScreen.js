
import React from "react";
import { View,Text,Button,StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";

export default HomeScreen = () =>{
    
      const navigation= useNavigation()
        return (
          <View style={styles.container}>
            <Text style={styles.logo}>TAKAS TİNDER</Text>
            <View style={styles.buttonContainer}>
              <Button title="Kayıt Ol" onPress={()=>navigation.navigate("Register")}/>
              <Button title="Giriş Yap" onPress={()=>navigation.navigate("Sign In")}  />
            </View>
          </View>
        );
      };
      
      const styles = StyleSheet.create({
        container: {
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
        },
        logo: {
          fontSize: 24,
          fontWeight: 'bold',
          marginBottom: 50,
        },
        buttonContainer: {
          width: '80%',
          justifyContent: 'space-between',
        },
      });

