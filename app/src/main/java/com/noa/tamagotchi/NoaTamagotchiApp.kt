package com.noa.tamagotchi

import android.app.Application
import com.noa.tamagotchi.data.TamagotchiPreferencesDataSource
import com.noa.tamagotchi.data.TamagotchiRepository

class NoaTamagotchiApp : Application() {
    val repository: TamagotchiRepository by lazy {
        TamagotchiRepository(TamagotchiPreferencesDataSource.fromContext(this))
    }
}
