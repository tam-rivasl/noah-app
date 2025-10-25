package com.noa.tamagotchi.ui.state

import com.noa.tamagotchi.domain.model.TamagotchiState

data class NoaUiState(
    val isLoading: Boolean = true,
    val state: TamagotchiState? = null
)
