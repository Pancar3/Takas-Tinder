
import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet,TextInput,Image,TouchableOpacity,ScrollView, RefreshControl,Linking,FlatList} from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import firestore from '@react-native-firebase/firestore';
import { Picker } from '@react-native-picker/picker';
import RNPickerSelect from 'react-native-picker-select';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import { NavigationContainer } from '@react-navigation/native';
import auth from '@react-native-firebase/auth';
import { GiftedChat } from 'react-native-gifted-chat';



const ProductAddScreen = () => {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState([
    { label: 'Kategori 1', value: 'kategori1' },
    { label: 'Kategori 2', value: 'kategori2' },
    { label: 'Kategori 3', value: 'kategori3' },
  ]);
  const [productName, setProductName] = useState('');
  const [productDemandedItem, setProductDemandedItem] = useState('');
  const [productPhotoURI, setProductPhotoURI] = useState('');

  const handleAddProduct = async () => {
    if (!selectedCategory) {
      alert('Lütfen bir kategori seçin.');
      return;
    }

    try {
      const currentUser = auth().currentUser;
      if (currentUser) {
        const email = currentUser.email;

        await firestore().collection('Products').add({
          category: selectedCategory,
          demand: productDemandedItem,
          name: productName,
          photo: productPhotoURI,
          user: email
        });

        alert('Ürün başarıyla eklendi.');
      } else {
        alert('Kullanıcı oturumu açmamış.');
      }
    } catch (error) {
      alert('Ürün eklenirken bir hata oluştu.');
    }
  };

  const handleSelectPhoto = () => {
    const options = {
      mediaType: 'photo',
      quality: 1,
    };

    launchImageLibrary(options, (response) => {
      if (response.didCancel) {
        console.log('Kullanıcı fotoğraf seçmeyi iptal etti');
      } else if (response.errorCode) {
        console.log('Fotoğraf seçme hatası:', response.errorMessage);
      } else {
        setProductPhotoURI(response.uri);
      }
    });
  };

  return (
    <View style={styles.container}>
      <Text>Ürün Ekle</Text>
      <RNPickerSelect
        placeholder={{ label: 'Kategori Seçin', value: null }}
        value={selectedCategory}
        onValueChange={(itemValue) => setSelectedCategory(itemValue)}
        items={categories}
      />
      <TextInput
        style={styles.input}
        placeholder="Ürün Adı"
        onChangeText={(text) => setProductName(text)}
      />
      <TextInput
        style={styles.input}
        placeholder="Takas İstediğiniz Ürün"
        onChangeText={(text) => setProductDemandedItem(text)}
      />
      <TouchableOpacity style={styles.selectPhotoButton} onPress={handleSelectPhoto}>
        <Text style={styles.selectPhotoButtonText}>Fotoğraf Seç</Text>
      </TouchableOpacity>
      {productPhotoURI ? (
        <Image source={{ uri: productPhotoURI }} style={styles.productPhoto} />
      ) : null}
      <Button title="Ürün Ekle" onPress={handleAddProduct} />
    </View>
  );
};

const ProductListScreen = () => {
  const [products, setProducts] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const currentUser = auth().currentUser;

  const fetchProducts = async () => {
    try {
      const productsSnapshot = await firestore().collection('Products').where('user', '==', currentUser.email).get();
      const productsData = productsSnapshot.docs.map((doc) => doc.data());
      setProducts(productsData);
    } catch (error) {
      console.log('Ürünler getirilirken bir hata oluştu:', error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDeleteProduct = async (productName) => {
    try {
      await firestore()
        .collection('Products')
        .where('name', '==', productName)
        .where('user','==' , currentUser.email)
        .get()
        .then((querySnapshot) => {
          querySnapshot.forEach((doc) => {
            doc.ref.delete();
          });
        });

      alert('Ürün başarıyla silindi.');
      fetchProducts();
    } catch (error) {
      console.log('Ürün silinirken bir hata oluştu:', error);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchProducts();
    setRefreshing(false);
  };

  return (
    <View style={styles.container}>
      <Text>Ürün Listesi</Text>
      <ScrollView
        style={styles.productList}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
      >
        {products.map((product, index) => (
          <View key={index} style={styles.productItem}>
            <Text style={styles.productName}>{product.name}</Text>
            <Text style={styles.productCategory}>{product.category}</Text>
            <Text style={styles.productDemandedItem}>{product.demand}</Text>
            <Image source={{ uri: product.photo }} style={styles.productPhoto} />
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => handleDeleteProduct(product.name)}
            >
              <Text style={styles.deleteButtonText}>Sil</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};


const Matchlist = () => {
  const [matchingDocuments, setMatchingDocuments] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const currentUser = auth().currentUser;

  useEffect(() => {
    fetchData();
  }, [currentUser]);

  const fetchData = async () => {
    try {
      setRefreshing(true);

      const userDocumentsSnapshot = await firestore()
        .collection('Products')
        .where('user', '==', currentUser.email)
        .get();

      const matchingDocumentsArray = [];

      await Promise.all(
        userDocumentsSnapshot.docs.map(async (userDoc) => {
          const userData = userDoc.data();

          const allDocumentsSnapshot = await firestore()
            .collection('Products')
            .where('demand', '==', userData.name)
            .where('name', '==', userData.demand)
            .get();

          allDocumentsSnapshot.forEach((documentDoc) => {
            const documentData = documentDoc.data();

            if (documentData.user !== currentUser.email) {
              matchingDocumentsArray.push({
                userEmail: documentData.user,
                productName: documentData.name,
              });
            }
          });
        })
      );

      setMatchingDocuments(matchingDocumentsArray);
      setRefreshing(false);
    } catch (error) {
      console.error('Hata:', error);
      setRefreshing(false);
    }
  };

  const renderItem = ({ item }) => (
    <View style={{ marginVertical: 10 }}>
      <Text>Kullanıcı Mail: {item.userEmail}</Text>
      <Text>İstediğiniz ürün: {item.productName}</Text>
      <TouchableOpacity onPress={() => handleEmailPress(item.userEmail)}>
        <Text style={{ color: 'blue', textDecorationLine: 'underline' }}>Mail Gönder</Text>
      </TouchableOpacity>
    </View>
  );

  const handleRefresh = () => {
    fetchData();
  };

  const handleEmailPress = (email) => {
    Linking.openURL(`mailto:${email}`);
  };

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>Match olunan Kullanıcılar</Text>
      <FlatList
        data={matchingDocuments}
        renderItem={renderItem}
        keyExtractor={(item, index) => index.toString()}
        refreshing={refreshing}
        onRefresh={handleRefresh}
      />
    </View>
  );
};









const Tab = createBottomTabNavigator();

const OHomeScreen = () => {
  const navigation = useNavigation();

  return (
   
      <Tab.Navigator>
        <Tab.Screen name="Ürün Ekle" component={ProductAddScreen} />
        <Tab.Screen name="Ürün Listesi" component={ProductListScreen} />
        <Tab.Screen name="Match listesi" component={Matchlist} />

      </Tab.Navigator>
   
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    height: 40,
    width: '80%',
    borderColor: 'gray',
    borderWidth: 1,
    marginTop: 10,
    marginBottom: 10,
    paddingLeft: 10,
  },
  selectPhotoButton: {
    backgroundColor: 'lightblue',
    padding: 10,
    marginBottom: 10,
  },
  selectPhotoButtonText: {
    color: 'white',
    textAlign: 'center',
  },
  productPhoto: {
    width: 200,
    height: 200,
    marginBottom: 10,
  },
  productList: {
    width: '100%',
    height: '100%',
  },
  productItem: {
    borderBottomWidth: 1,
    borderBottomColor: 'gray',
    padding: 10,
  },
  productName: {
    fontWeight: 'bold',
  },
  productCategory: {
    fontStyle: 'italic',
  },
  productDemandedItem: {
    marginTop: 5,
    marginBottom: 5,
  },
  deleteButton: {
    backgroundColor: 'red',
    padding: 5,
    alignSelf: 'flex-end',
  },
  deleteButtonText: {
    color: 'white',
  },
});

export default OHomeScreen;