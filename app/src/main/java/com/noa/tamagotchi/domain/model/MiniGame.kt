package com.noa.tamagotchi.domain.model

data class MiniGame(
    val id: String,
    val name: String,
    val description: String,
    val rewardCoins: Int,
    val rewardExperience: Int
)
