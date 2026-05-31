// Configura toda a navegação do app.
// Tab Navigator = barra de abas na parte de baixo.
// Stack Navigator = navegação em pilha (abre telas sobre outras telas).

import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Text } from 'react-native';

import HomeScreen     from '../screens/HomeScreen';
import RecipesScreen  from '../screens/RecipesScreen';
import ListScreen     from '../screens/ListScreen';
import ProfileScreen  from '../screens/ProfileScreen';
import MarketScreen   from '../screens/MarketScreen';

import { colors, typography } from '../theme';

const Tab   = createBottomTabNavigator();
const Stack = createStackNavigator();

// Ícones temporários em texto até instalarmos uma biblioteca de ícones
const icone = (label) => ({ focused }) => (
  <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.4 }}>
    { label === 'Início' ? '🏠' : label === 'Receitas' ? '🍽️' : label === 'Lista' ? '🛒' : '👤' }
  </Text>
);

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          height: 60,
          paddingBottom: 8,
        },
        tabBarLabelStyle: {
          fontFamily: typography.fontSans,
          fontSize: typography.sizes.xs,
          color: colors.textSecondary,
        },
        tabBarActiveTintColor:   colors.primary,
        tabBarInactiveTintColor: colors.textDisabled,
      }}
    >
      <Tab.Screen name="Início"    component={HomeScreen}    options={{ tabBarIcon: icone('Início') }} />
      <Tab.Screen name="Receitas"  component={RecipesScreen} options={{ tabBarIcon: icone('Receitas') }} />
      <Tab.Screen name="Lista"     component={ListScreen}    options={{ tabBarIcon: icone('Lista') }} />
      <Tab.Screen name="Perfil"    component={ProfileScreen} options={{ tabBarIcon: icone('Perfil') }} />
    </Tab.Navigator>
  );
}

export default function Navigation() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {/* Tela principal com as abas */}
        <Stack.Screen name="Main" component={TabNavigator} />
        {/* Modo Mercado abre por cima das abas, sem barra de navegação */}
        <Stack.Screen name="Mercado" component={MarketScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
