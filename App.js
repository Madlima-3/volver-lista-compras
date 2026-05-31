// Ponto de entrada do app.
// Inicializa o banco de dados antes de mostrar qualquer tela.

import { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';

import Navigation from './src/navigation';
import { inicializarBanco } from './src/database/db';
import { colors, typography } from './src/theme';

export default function App() {
  const [pronto, setPronto] = useState(false);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    inicializarBanco()
      .then(() => setPronto(true))
      .catch((e) => setErro(e.message));
  }, []);

  if (erro) {
    return (
      <View style={styles.centro}>
        <Text style={styles.erroTexto}>Erro ao iniciar: {erro}</Text>
      </View>
    );
  }

  if (!pronto) {
    return (
      <View style={styles.centro}>
        <Text style={styles.carregandoTexto}>Carregando...</Text>
      </View>
    );
  }

  return (
    <>
      <StatusBar style="dark" />
      <Navigation />
    </>
  );
}

const styles = StyleSheet.create({
  centro: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  carregandoTexto: {
    color: colors.textMuted,
    fontSize: typography.sizes.base,
  },
  erroTexto: {
    color: colors.pink,
    fontSize: typography.sizes.base,
    padding: 24,
    textAlign: 'center',
  },
});
