import React, { useState, useEffect } from "react";
import { StyleSheet, ActivityIndicator } from "react-native";
import { Input, Button, Layout, Text } from "@ui-kitten/components";
import { useDispatch } from "react-redux";
import { userAuth, deleteUser } from "../../../redux/actions";
import TestDb from "../../TestDb/TestDb";
import { firebase } from "../../../../firebase";
import "@firebase/firestore";
import "@firebase/auth";
import * as Google from "expo-google-app-auth";
import AsyncStorage from '@react-native-community/async-storage';

const provider = new firebase.auth.GoogleAuthProvider();

const AuthForm = () => { 
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [err, setError] = useState(null);
  const [test, setTest] = useState(false);
  const [userStore, setUserStore] = useState(null); 
  const dispatch = useDispatch();

  const save = async (user) => {
    try {
      const objectValue = JSON.stringify(user)
     await AsyncStorage.setItem('user', objectValue)
    } catch(e) {
      const error = new Error(e)
      setError(error.message);
    }
  }

  const remove = async () => {
    try {
      await AsyncStorage.removeItem('user')
    } catch(e) {
      const error = new Error(e)
      setError(error.message);
    } finally {
      setUserStore('');
    }
  }

  const Login = async () => {
    try {
      const user = await firebase
        .auth()
        .signInWithEmailAndPassword(email, pass);
      const currentUser = await firebase.auth().currentUser
      setEmail("");
      setPass("");
      setTest(true);
      setUserStore(currentUser)
      dispatch(userAuth(true));
      save(currentUser); // asyncStorage
    } catch (err) {
      const error = new Error(err);
      setError(error.message);
    }
  };

  const logout = async () => {
    dispatch(deleteUser());
    remove()
    await firebase.auth().signOut();
    const user = firebase.auth().currentUser;
    return user ? console.log("logout", user) : console.log("signOut");
  };

  const onSignIn = (googleUser) => {
    const unsubscribe = firebase
      .auth()
      .onAuthStateChanged(function (firebaseUser) {
        unsubscribe();
        if (!isUserEqual(googleUser, firebaseUser)) {
          const credential = firebase.auth.GoogleAuthProvider.credential(
            googleUser.idToken,
            googleUser.accessToken
          );
          firebase
            .auth()
            .signInWithCredential(credential)
            .then(async function (user) {
              const userAuth = user.user;
              // setUserStore(userAuth)
              // save(); // asyncStorage
              // dispatch(setUser(userAuth))
              // console.log('userAuth on sign in>>>>>>>>>>>>>>',userAuth);
              // save(userAuth)
              await firebase
                .firestore()
                .collection("users")
                .doc(user.user.uid)
                .set({
                  email: userAuth.email,
                  displayName: userAuth.displayName,
                  phoneNumber: userAuth.phoneNumber,
                  photoURL: userAuth.photoURL,
                  emailVerified: userAuth.emailVerified,
                  habits: [],
                });
            })
            .catch(function (error) {
              const errorCode = error.code;
              errorCode ? setError(errorCode) : null
              const errorMessage = error.message;
              errorCode ? setError(errorMessage) : null
              const email = error.email;
              errorCode ? setError(email) : null
              const credential = error.credential;
              errorCode ? setError(credential) : null
              console.log(errorCode);
              console.log(errorMessage);
              console.log(email);
              console.log(credential);
            });
        } else {
          setError("User already signed-in Firebase.")
          console.log("User already signed-in Firebase.");
        }
      });
  };

  // console firebase id client old 331031432009-jd9240r775sse5hcm436i3l47r8pkeq7.apps.googleusercontent.com

  const isUserEqual = (googleUser, firebaseUser) => {
    if (firebaseUser) {
      const providerData = firebaseUser.providerData;
      for (let i = 0; i < providerData.length; i++) {
        if (
          providerData[i].providerId ===
            firebase.auth.GoogleAuthProvider.PROVIDER_ID &&
          providerData[i].uid === googleUser.getBasicProfile().getId()
        ) {
          return true;
        }
      }
    }
    return false;
  };

  async function signInWithGoogleAsync() {
    try {
      // console.log(">>>>>>>>>", firebase.auth().currentUser);
      const result = await Google.logInAsync({
        // androidClientId: YOUR_CLIENT_ID_HERE,
        behavior: "web",
        iosClientId:
          "531972357750-se0jv52p37gs986lcv4j8sma2crlom3i.apps.googleusercontent.com",
        scopes: ["profile", "email"],
      });

      if (result.type === "success") {
        setError(null)
        onSignIn(result);
        setUserStore(result.user)
        dispatch(userAuth(true));
        save(result.user)
        // dispatch(setUser(result.user));
        // navigate
        return result.accessToken;
      } else {
        return setError("Something went wrong");
      }
    } catch (e) {
      const error = new Error(e);
      return setError(error.message);
    } 
  }

  return (
    <Layout style={{backgroundColor:"white", alignItems: "center", top: 250 }} level="1" >
      <Input
        style={{ width: "75%" }}
        placeholder="Email"
        value={email}
        onChangeText={(nextValue) => setEmail(nextValue)}
      />
      <Input

        style={{ width: "75%" }}
        secureTextEntry={true}
        placeholder="Password"
        value={pass}
        onChangeText={(nextValue) => setPass(nextValue)}
      />
      <Button style={{ width: "75%", marginBottom: 5 }} onPress={Login}>Sugn Up</Button>
      <Button style={{ width: "75%", marginBottom: 5 }} onPress={() => signInWithGoogleAsync()}>
        Sign Up With Google
      </Button>
      <Button style={{ width: "75%", marginBottom: 5 }} onPress={logout}>Logout</Button>
      {test ? <TestDb /> : null}
      {err ? <Text>{err}</Text> : null}
    </Layout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default AuthForm;
