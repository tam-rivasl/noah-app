package com.noa.tamagotchi.ui.state

import com.noa.tamagotchi.domain.model.MiniGame
import com.noa.tamagotchi.domain.model.NoaState
import com.noa.tamagotchi.domain.model.ShopItem

data class NoaUiState(
    val isLoading: Boolean = true,
    val noaState: NoaState = NoaState(),
    val alerts: List<String> = emptyList(),
    val availableItems: List<ShopItem> = emptyList(),
    val miniGames: List<MiniGame> = emptyList(),
    val dailyRewardAvailable: Boolean = true
)
