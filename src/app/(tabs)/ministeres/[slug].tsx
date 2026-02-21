/**
 * Écran détail d'un ministère
 */

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useMinisteres } from "../../../hooks/useMinisteres";
import { DepartmentCard } from "../../../components/features/ministere";
import { Ministere, Department } from "../../../types/database";
import { ministereService } from "../../../services/ministere.service";

export default function MinistereDetailScreen() {
  const router = useRouter();
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const {
    ministeres,
    departments,
    isLoading,
    loadData,
    joinDepartment,
    leaveDepartment,
    isMemberOfDepartment,
    getUserDepartmentsCount,
    getIconName,
  } = useMinisteres();

  const [refreshing, setRefreshing] = useState(false);
  const [ministere, setMinistere] = useState<Ministere | null>(null);
  const [ministereDepartments, setMinistereDepartments] = useState<Department[]>([]);
  const [isJoining, setIsJoining] = useState<string | null>(null);

  useEffect(() => {
    if (slug && ministeres.length > 0) {
      const found = ministeres.find((m) => m.slug === slug);
      setMinistere(found || null);

      if (found) {
        const depts = departments.filter((d) => d.ministere_id === found.id);
        setMinistereDepartments(depts);
      }
    }
  }, [slug, ministeres, departments]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleJoinDepartment = async (departmentId: string, departmentName: string) => {
    const currentCount = getUserDepartmentsCount();

    if (currentCount >= 5) {
      Alert.alert(
        "Limite atteinte",
        "Vous ne pouvez pas rejoindre plus de 5 départements. Veuillez d'abord quitter un département."
      );
      return;
    }

    Alert.alert(
      "Rejoindre le département",
      `Voulez-vous rejoindre le département "${departmentName}" ?`,
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Rejoindre",
          onPress: async () => {
            setIsJoining(departmentId);
            const success = await joinDepartment(departmentId);
            setIsJoining(null);

            if (success) {
              Alert.alert("Succès", "Vous avez rejoint le département !");
            }
          },
        },
      ]
    );
  };

  const handleLeaveDepartment = async (departmentId: string, departmentName: string) => {
    Alert.alert(
      "Quitter le département",
      `Voulez-vous vraiment quitter le département "${departmentName}" ?`,
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Quitter",
          style: "destructive",
          onPress: async () => {
            setIsJoining(departmentId);
            await leaveDepartment(departmentId);
            setIsJoining(null);
          },
        },
      ]
    );
  };

  if (isLoading && !refreshing) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      </SafeAreaView>
    );
  }

  if (!ministere) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Ministère</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#d1d5db" />
          <Text style={styles.errorText}>Ministère non trouvé</Text>
        </View>
      </SafeAreaView>
    );
  }

  const iconName = getIconName(ministere.icon);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{ministere.name}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Hero */}
        <View style={[styles.heroCard, { backgroundColor: ministere.color }]}>
          <View style={styles.heroIconContainer}>
            <Ionicons name={iconName as any} size={40} color="#ffffff" />
          </View>
          <Text style={styles.heroTitle}>{ministere.name}</Text>
          {ministere.description && (
            <Text style={styles.heroDescription}>{ministere.description}</Text>
          )}
        </View>

        {/* Départements (si Direction des Cultes) */}
        {ministereDepartments.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Départements</Text>
              <Text style={styles.sectionCount}>
                {ministereDepartments.length} disponibles
              </Text>
            </View>

            <View style={styles.infoBox}>
              <Ionicons name="information-circle" size={18} color="#f59e0b" />
              <Text style={styles.infoBoxText}>
                Vous pouvez rejoindre jusqu'à 5 départements. L'Académie de Réveil est requise pour servir.
              </Text>
            </View>

            {ministereDepartments.map((dept) => {
              const isMember = isMemberOfDepartment(dept.id);
              return (
                <TouchableOpacity
                  key={dept.id}
                  activeOpacity={0.7}
                  onPress={() =>
                    isMember
                      ? handleLeaveDepartment(dept.id, dept.name)
                      : handleJoinDepartment(dept.id, dept.name)
                  }
                  disabled={isJoining === dept.id}
                >
                  <View style={[
                    styles.departmentItem,
                    isMember && styles.departmentItemMember,
                  ]}>
                    <View style={[styles.deptIcon, { backgroundColor: `${dept.color}15` }]}>
                      <Ionicons
                        name={getIconName(dept.icon) as any}
                        size={20}
                        color={dept.color}
                      />
                    </View>
                    <View style={styles.deptContent}>
                      <Text style={styles.deptName}>{dept.name}</Text>
                      {dept.description && (
                        <Text style={styles.deptDescription} numberOfLines={1}>
                          {dept.description}
                        </Text>
                      )}
                    </View>
                    {isJoining === dept.id ? (
                      <ActivityIndicator size="small" color={ministere.color} />
                    ) : isMember ? (
                      <View style={styles.memberTag}>
                        <Ionicons name="checkmark-circle" size={16} color="#22c55e" />
                        <Text style={styles.memberTagText}>Membre</Text>
                      </View>
                    ) : (
                      <TouchableOpacity
                        style={[styles.joinButton, { backgroundColor: ministere.color }]}
                        onPress={() => handleJoinDepartment(dept.id, dept.name)}
                      >
                        <Ionicons name="add" size={18} color="#ffffff" />
                      </TouchableOpacity>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* Contenu selon le ministère */}
        {ministere.slug === "croissance" && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Zones géographiques</Text>
            <View style={styles.comingSoon}>
              <Ionicons name="map-outline" size={48} color="#d1d5db" />
              <Text style={styles.comingSoonText}>
                La gestion des zones et familles de réveil sera bientôt disponible.
              </Text>
            </View>
          </View>
        )}

        {ministere.slug === "formation" && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Formations disponibles</Text>
            <TouchableOpacity
              style={styles.linkCard}
              onPress={() => router.push("/(tabs)/formations" as any)}
            >
              <Ionicons name="school" size={24} color="#8b5cf6" />
              <View style={styles.linkContent}>
                <Text style={styles.linkTitle}>Accéder aux formations</Text>
                <Text style={styles.linkSubtitle}>
                  Académie de Réveil, École des Bergers, Baptême
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#d1d5db" />
            </TouchableOpacity>
          </View>
        )}

        {ministere.slug === "priere" && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Vie de prière</Text>
            <TouchableOpacity
              style={styles.linkCard}
              onPress={() => router.push("/(tabs)/prayer" as any)}
            >
              <Ionicons name="heart" size={24} color="#ec4899" />
              <View style={styles.linkContent}>
                <Text style={styles.linkTitle}>Accéder à la prière</Text>
                <Text style={styles.linkSubtitle}>
                  Journal de prière, jeûnes, demandes
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#d1d5db" />
            </TouchableOpacity>
          </View>
        )}

        {ministere.slug === "integration" && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tribus d'Israël</Text>
            <TouchableOpacity
              style={styles.linkCard}
              onPress={() => router.push("/(tabs)/community" as any)}
            >
              <Ionicons name="people" size={24} color="#3b82f6" />
              <View style={styles.linkContent}>
                <Text style={styles.linkTitle}>Voir ma tribu</Text>
                <Text style={styles.linkSubtitle}>
                  Découvrez les 12 tribus et votre affectation
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#d1d5db" />
            </TouchableOpacity>
          </View>
        )}

        {/* GO - Ministère d'Évangélisation */}
        {ministere.slug === "go" && (
          <View style={styles.section}>
            <Text style={styles.descriptionText}>
              Le ministère GO est le bras d'évangélisation de l'église. Notre mission est d'atteindre les perdus par des croisades, des campagnes d'évangélisation et des équipes de terrain déployées dans les quartiers, les villes et au-delà.
            </Text>

            <Text style={styles.activitiesTitle}>Nos activités</Text>

            <View style={styles.activityCard}>
              <View style={[styles.activityIcon, { backgroundColor: "#fef3c7" }]}>
                <Ionicons name="megaphone" size={20} color="#f59e0b" />
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>Croisades d'évangélisation</Text>
                <Text style={styles.activitySubtitle}>
                  Événements publics de proclamation de l'Évangile en plein air
                </Text>
              </View>
            </View>

            <View style={styles.activityCard}>
              <View style={[styles.activityIcon, { backgroundColor: "#dbeafe" }]}>
                <Ionicons name="people" size={20} color="#3b82f6" />
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>Équipes de terrain</Text>
                <Text style={styles.activitySubtitle}>
                  Groupes déployés dans les quartiers pour le porte-à-porte et le témoignage
                </Text>
              </View>
            </View>

            <View style={styles.activityCard}>
              <View style={[styles.activityIcon, { backgroundColor: "#fce7f3" }]}>
                <Ionicons name="heart" size={20} color="#ec4899" />
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>Campagnes de sensibilisation</Text>
                <Text style={styles.activitySubtitle}>
                  Actions ciblées : hôpitaux, prisons, marchés, universités
                </Text>
              </View>
            </View>

            <View style={styles.activityCard}>
              <View style={[styles.activityIcon, { backgroundColor: "#d1fae5" }]}>
                <Ionicons name="globe" size={20} color="#10b981" />
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>Missions et envois</Text>
                <Text style={styles.activitySubtitle}>
                  Voyages missionnaires nationaux et internationaux
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Famille - Ministère de la Famille */}
        {ministere.slug === "famille" && (
          <View style={styles.section}>
            <Text style={styles.descriptionText}>
              Le ministère Famille accompagne chaque étape de la vie familiale au sein de l'église. Des préparations au mariage à l'encadrement des enfants et des jeunes, nous bâtissons des familles solides enracinées dans la foi.
            </Text>

            <Text style={styles.activitiesTitle}>Nos activités</Text>

            <View style={styles.activityCard}>
              <View style={[styles.activityIcon, { backgroundColor: "#fce7f3" }]}>
                <Ionicons name="heart" size={20} color="#ec4899" />
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>Noces — Préparation au mariage</Text>
                <Text style={styles.activitySubtitle}>
                  Accompagnement des couples vers le mariage : sessions, conseils, cérémonies
                </Text>
              </View>
            </View>

            <View style={styles.activityCard}>
              <View style={[styles.activityIcon, { backgroundColor: "#fef3c7" }]}>
                <Ionicons name="happy" size={20} color="#f59e0b" />
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>Écoveil — Enfants (0-14 ans)</Text>
                <Text style={styles.activitySubtitle}>
                  École du dimanche, activités ludiques et enseignement biblique adapté
                </Text>
              </View>
            </View>

            <View style={styles.activityCard}>
              <View style={[styles.activityIcon, { backgroundColor: "#dbeafe" }]}>
                <Ionicons name="sparkles" size={20} color="#3b82f6" />
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>Next Gen — Jeunes (14-21 ans)</Text>
                <Text style={styles.activitySubtitle}>
                  Cultes jeunes, retraites, mentorat et activités de croissance spirituelle
                </Text>
              </View>
            </View>

            <View style={styles.activityCard}>
              <View style={[styles.activityIcon, { backgroundColor: "#d1fae5" }]}>
                <Ionicons name="home" size={20} color="#10b981" />
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>Séminaires familiaux</Text>
                <Text style={styles.activitySubtitle}>
                  Conférences et ateliers sur la vie conjugale, la parentalité et la communication
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Église en Ligne */}
        {ministere.slug === "eglise-en-ligne" && (
          <View style={styles.section}>
            <Text style={styles.descriptionText}>
              L'Église en Ligne étend la portée de notre communauté au-delà des murs physiques. Par le streaming en direct, les ressources numériques et la communauté virtuelle, nous connectons les membres où qu'ils soient dans le monde.
            </Text>

            <Text style={styles.activitiesTitle}>Nos activités</Text>

            <View style={styles.activityCard}>
              <View style={[styles.activityIcon, { backgroundColor: "#fee2e2" }]}>
                <Ionicons name="videocam" size={20} color="#ef4444" />
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>Diffusion en direct</Text>
                <Text style={styles.activitySubtitle}>
                  Retransmission des cultes, conférences et événements spéciaux en live
                </Text>
              </View>
            </View>

            <View style={styles.activityCard}>
              <View style={[styles.activityIcon, { backgroundColor: "#dbeafe" }]}>
                <Ionicons name="chatbubbles" size={20} color="#3b82f6" />
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>Communauté en ligne</Text>
                <Text style={styles.activitySubtitle}>
                  Groupes de discussion, forums de prière et cellules virtuelles
                </Text>
              </View>
            </View>

            <View style={styles.activityCard}>
              <View style={[styles.activityIcon, { backgroundColor: "#ede9fe" }]}>
                <Ionicons name="library" size={20} color="#8b5cf6" />
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>Ressources numériques</Text>
                <Text style={styles.activitySubtitle}>
                  Prédications en replay, études bibliques, podcasts et dévotionnels
                </Text>
              </View>
            </View>

            <View style={styles.activityCard}>
              <View style={[styles.activityIcon, { backgroundColor: "#d1fae5" }]}>
                <Ionicons name="globe" size={20} color="#10b981" />
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>Suivi pastoral à distance</Text>
                <Text style={styles.activitySubtitle}>
                  Accompagnement et soutien pastoral pour les membres éloignés
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* 222 - Ministère des Médias et Partenaires */}
        {ministere.slug === "222" && (
          <View style={styles.section}>
            <Text style={styles.descriptionText}>
              Le ministère 222 regroupe les équipes de production médiatique, de communication et de partenariat. Nous produisons du contenu de qualité, gérons la visibilité de l'église et développons des partenariats stratégiques pour l'avancement du Royaume.
            </Text>

            <Text style={styles.activitiesTitle}>Nos activités</Text>

            <View style={styles.activityCard}>
              <View style={[styles.activityIcon, { backgroundColor: "#ede9fe" }]}>
                <Ionicons name="film" size={20} color="#8b5cf6" />
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>Production audiovisuelle</Text>
                <Text style={styles.activitySubtitle}>
                  Tournage, montage vidéo, photographie et création de contenus visuels
                </Text>
              </View>
            </View>

            <View style={styles.activityCard}>
              <View style={[styles.activityIcon, { backgroundColor: "#dbeafe" }]}>
                <Ionicons name="share-social" size={20} color="#3b82f6" />
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>Communication & Réseaux sociaux</Text>
                <Text style={styles.activitySubtitle}>
                  Gestion des plateformes, stratégie digitale et engagement communautaire
                </Text>
              </View>
            </View>

            <View style={styles.activityCard}>
              <View style={[styles.activityIcon, { backgroundColor: "#fef3c7" }]}>
                <Ionicons name="link" size={20} color="#f59e0b" />
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>Partenariats</Text>
                <Text style={styles.activitySubtitle}>
                  Développement de relations avec d'autres ministères, organisations et sponsors
                </Text>
              </View>
            </View>

            <View style={styles.activityCard}>
              <View style={[styles.activityIcon, { backgroundColor: "#fee2e2" }]}>
                <Ionicons name="newspaper" size={20} color="#ef4444" />
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>Graphisme & Publications</Text>
                <Text style={styles.activitySubtitle}>
                  Affiches, flyers, bulletins d'information et supports imprimés
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Étudiants - Ministère Étudiant */}
        {ministere.slug === "etudiants" && (
          <View style={styles.section}>
            <Text style={styles.descriptionText}>
              Le ministère Étudiants accompagne les jeunes dans leur parcours académique et spirituel. Sur les campus et au sein de l'église, nous formons une génération de leaders chrétiens brillants et engagés.
            </Text>

            <Text style={styles.activitiesTitle}>Nos activités</Text>

            <View style={styles.activityCard}>
              <View style={[styles.activityIcon, { backgroundColor: "#dbeafe" }]}>
                <Ionicons name="school" size={20} color="#3b82f6" />
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>Groupes sur campus</Text>
                <Text style={styles.activitySubtitle}>
                  Cellules de prière et d'étude biblique dans les universités et grandes écoles
                </Text>
              </View>
            </View>

            <View style={styles.activityCard}>
              <View style={[styles.activityIcon, { backgroundColor: "#fef3c7" }]}>
                <Ionicons name="bulb" size={20} color="#f59e0b" />
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>Soutien académique</Text>
                <Text style={styles.activitySubtitle}>
                  Tutorat, ateliers de méthodologie et aide à l'orientation professionnelle
                </Text>
              </View>
            </View>

            <View style={styles.activityCard}>
              <View style={[styles.activityIcon, { backgroundColor: "#d1fae5" }]}>
                <Ionicons name="calendar" size={20} color="#10b981" />
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>Événements étudiants</Text>
                <Text style={styles.activitySubtitle}>
                  Retraites, soirées louange, conférences et rencontres inter-campus
                </Text>
              </View>
            </View>

            <View style={styles.activityCard}>
              <View style={[styles.activityIcon, { backgroundColor: "#ede9fe" }]}>
                <Ionicons name="people" size={20} color="#8b5cf6" />
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>Mentorat étudiant</Text>
                <Text style={styles.activitySubtitle}>
                  Jumelage avec des mentors spirituels et professionnels pour un accompagnement personnalisé
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Smalah - Réseau Professionnel */}
        {ministere.slug === "smalah" && (
          <View style={styles.section}>
            <Text style={styles.descriptionText}>
              La Smalah est le réseau professionnel de l'église. Nous connectons les entrepreneurs, cadres et professionnels chrétiens pour un impact dans le monde du travail, à travers le mentorat, les événements de networking et le développement de carrière.
            </Text>

            <Text style={styles.activitiesTitle}>Nos activités</Text>

            <View style={styles.activityCard}>
              <View style={[styles.activityIcon, { backgroundColor: "#fef3c7" }]}>
                <Ionicons name="briefcase" size={20} color="#f59e0b" />
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>Networking professionnel</Text>
                <Text style={styles.activitySubtitle}>
                  Rencontres mensuelles entre entrepreneurs, cadres et porteurs de projets
                </Text>
              </View>
            </View>

            <View style={styles.activityCard}>
              <View style={[styles.activityIcon, { backgroundColor: "#dbeafe" }]}>
                <Ionicons name="person" size={20} color="#3b82f6" />
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>Mentorat de carrière</Text>
                <Text style={styles.activitySubtitle}>
                  Accompagnement individuel par des professionnels expérimentés de la communauté
                </Text>
              </View>
            </View>

            <View style={styles.activityCard}>
              <View style={[styles.activityIcon, { backgroundColor: "#d1fae5" }]}>
                <Ionicons name="trending-up" size={20} color="#10b981" />
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>Développement professionnel</Text>
                <Text style={styles.activitySubtitle}>
                  Ateliers CV, préparation d'entretiens, gestion d'entreprise et leadership
                </Text>
              </View>
            </View>

            <View style={styles.activityCard}>
              <View style={[styles.activityIcon, { backgroundColor: "#ede9fe" }]}>
                <Ionicons name="business" size={20} color="#8b5cf6" />
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>Conférences & Séminaires</Text>
                <Text style={styles.activitySubtitle}>
                  Intervenants inspirants sur la foi au travail, l'éthique et l'excellence professionnelle
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Louange - Ministère de Louange */}
        {ministere.slug === "louange" && (
          <View style={styles.section}>
            <Text style={styles.descriptionText}>
              Le ministère de Louange conduit l'église dans l'adoration et la présence de Dieu. Nos équipes de worship, la chorale et les musiciens se consacrent à créer une atmosphère de louange authentique et puissante à chaque rassemblement.
            </Text>

            <Text style={styles.activitiesTitle}>Nos activités</Text>

            <View style={styles.activityCard}>
              <View style={[styles.activityIcon, { backgroundColor: "#ede9fe" }]}>
                <Ionicons name="musical-notes" size={20} color="#8b5cf6" />
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>Équipes de worship</Text>
                <Text style={styles.activitySubtitle}>
                  Conducteurs de louange, chanteurs et musiciens pour les cultes et événements
                </Text>
              </View>
            </View>

            <View style={styles.activityCard}>
              <View style={[styles.activityIcon, { backgroundColor: "#fef3c7" }]}>
                <Ionicons name="people" size={20} color="#f59e0b" />
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>Chorale</Text>
                <Text style={styles.activitySubtitle}>
                  Ensemble vocal pour les cantiques, gospel et chants de célébration
                </Text>
              </View>
            </View>

            <View style={styles.activityCard}>
              <View style={[styles.activityIcon, { backgroundColor: "#dbeafe" }]}>
                <Ionicons name="musical-note" size={20} color="#3b82f6" />
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>Instrumentistes</Text>
                <Text style={styles.activitySubtitle}>
                  Clavier, guitare, batterie, basse et autres instruments au service de la louange
                </Text>
              </View>
            </View>

            <View style={styles.activityCard}>
              <View style={[styles.activityIcon, { backgroundColor: "#d1fae5" }]}>
                <Ionicons name="school" size={20} color="#10b981" />
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>Formation musicale</Text>
                <Text style={styles.activitySubtitle}>
                  Cours de chant, apprentissage d'instruments et répétitions hebdomadaires
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Message par défaut pour les ministères non implémentés */}
        {!["direction-cultes", "croissance", "formation", "priere", "integration", "go", "famille", "eglise-en-ligne", "222", "etudiants", "smalah", "louange"].includes(ministere.slug) && (
          <View style={styles.section}>
            <View style={styles.comingSoon}>
              <Ionicons name="construct-outline" size={48} color="#d1d5db" />
              <Text style={styles.comingSoonText}>
                Les fonctionnalités de ce ministère seront bientôt disponibles.
              </Text>
            </View>
          </View>
        )}

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    fontSize: 16,
    color: "#9ca3af",
    marginTop: 12,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    flex: 1,
    textAlign: "center",
  },
  heroCard: {
    margin: 20,
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
  },
  heroIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#ffffff",
    textAlign: "center",
    marginBottom: 8,
  },
  heroDescription: {
    fontSize: 14,
    color: "rgba(255,255,255,0.9)",
    textAlign: "center",
    lineHeight: 20,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
  },
  sectionCount: {
    fontSize: 14,
    color: "#6b7280",
  },
  infoBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#fffbeb",
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
    gap: 10,
  },
  infoBoxText: {
    flex: 1,
    fontSize: 13,
    color: "#92400e",
    lineHeight: 18,
  },
  departmentItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  departmentItemMember: {
    backgroundColor: "#f0fdf4",
    borderWidth: 1,
    borderColor: "#bbf7d0",
  },
  deptIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  deptContent: {
    flex: 1,
  },
  deptName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 2,
  },
  deptDescription: {
    fontSize: 12,
    color: "#6b7280",
  },
  memberTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#dcfce7",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  memberTagText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#16a34a",
  },
  joinButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  comingSoon: {
    alignItems: "center",
    padding: 40,
    backgroundColor: "#ffffff",
    borderRadius: 16,
  },
  comingSoonText: {
    fontSize: 14,
    color: "#9ca3af",
    textAlign: "center",
    marginTop: 12,
    lineHeight: 20,
  },
  linkCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    gap: 14,
  },
  linkContent: {
    flex: 1,
  },
  linkTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 2,
  },
  linkSubtitle: {
    fontSize: 13,
    color: "#6b7280",
  },
  descriptionText: {
    fontSize: 14,
    color: "#4b5563",
    lineHeight: 22,
    marginBottom: 20,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
  },
  activitiesTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 12,
  },
  activityCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  activityIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 2,
  },
  activitySubtitle: {
    fontSize: 12,
    color: "#6b7280",
    lineHeight: 17,
  },
});