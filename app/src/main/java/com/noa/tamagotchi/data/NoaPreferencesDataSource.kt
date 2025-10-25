package com.noa.tamagotchi.data

import android.content.Context
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.intPreferencesKey
import androidx.datastore.preferences.core.longPreferencesKey
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.core.PreferenceDataStoreFactory
import androidx.datastore.preferences.preferencesDataStoreFile
import com.noa.tamagotchi.domain.model.NoaState
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.map
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json

class NoaPreferencesDataSource(private val dataStore: DataStore<Preferences>) {

    val noaState: Flow<NoaState> = dataStore.data.map { preferences ->
        NoaState(
            health = preferences[KEY_HEALTH] ?: 80,
            sleep = preferences[KEY_SLEEP] ?: 80,
            hunger = preferences[KEY_HUNGER] ?: 60,
            happiness = preferences[KEY_HAPPINESS] ?: 75,
            energy = preferences[KEY_ENERGY] ?: 70,
            coins = preferences[KEY_COINS] ?: 50,
            level = preferences[KEY_LEVEL] ?: 1,
            experience = preferences[KEY_EXPERIENCE] ?: 0,
            lastUpdated = preferences[KEY_LAST_UPDATED] ?: System.currentTimeMillis(),
            lastDailyReward = preferences[KEY_LAST_DAILY_REWARD] ?: 0L,
            inventory = preferences[KEY_INVENTORY]?.let { json ->
                Json.decodeFromString<Map<String, Int>>(json)
            } ?: emptyMap()
        )
    }

    suspend fun updateState(state: NoaState) {
        dataStore.edit { prefs ->
            prefs[KEY_HEALTH] = state.health
            prefs[KEY_SLEEP] = state.sleep
            prefs[KEY_HUNGER] = state.hunger
            prefs[KEY_HAPPINESS] = state.happiness
            prefs[KEY_ENERGY] = state.energy
            prefs[KEY_COINS] = state.coins
            prefs[KEY_LEVEL] = state.level
            prefs[KEY_EXPERIENCE] = state.experience
            prefs[KEY_LAST_UPDATED] = state.lastUpdated
            prefs[KEY_LAST_DAILY_REWARD] = state.lastDailyReward
            prefs[KEY_INVENTORY] = Json.encodeToString(state.inventory)
        }
    }

    suspend fun clear() {
        dataStore.edit { it.clear() }
    }

    suspend fun getCurrentState(): NoaState = noaState.first()

    companion object {
        private const val DATA_STORE_FILE = "noa_preferences.pb"
        private val KEY_HEALTH = intPreferencesKey("health")
        private val KEY_SLEEP = intPreferencesKey("sleep")
        private val KEY_HUNGER = intPreferencesKey("hunger")
        private val KEY_HAPPINESS = intPreferencesKey("happiness")
        private val KEY_ENERGY = intPreferencesKey("energy")
        private val KEY_COINS = intPreferencesKey("coins")
        private val KEY_LEVEL = intPreferencesKey("level")
        private val KEY_EXPERIENCE = intPreferencesKey("experience")
        private val KEY_LAST_UPDATED = longPreferencesKey("last_updated")
        private val KEY_LAST_DAILY_REWARD = longPreferencesKey("last_daily_reward")
        private val KEY_INVENTORY = stringPreferencesKey("inventory")

        fun fromContext(context: Context): NoaPreferencesDataSource = NoaPreferencesDataSource(
            PreferenceDataStoreFactory.create(
                produceFile = { context.preferencesDataStoreFile(DATA_STORE_FILE) }
            )
        )
    }
}
