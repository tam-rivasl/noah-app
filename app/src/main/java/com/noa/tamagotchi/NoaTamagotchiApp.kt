package com.noa.tamagotchi

import android.app.Application
import com.noa.tamagotchi.data.NoaPreferencesDataSource
import com.noa.tamagotchi.data.NoaRepository

class NoaTamagotchiApp : Application() {
    val repository: NoaRepository by lazy {
        NoaRepository(NoaPreferencesDataSource.fromContext(this))
    }
}
