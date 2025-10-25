package com.noa.tamagotchi.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import com.noa.tamagotchi.data.NoaRepository
import com.noa.tamagotchi.domain.model.GameAction
import com.noa.tamagotchi.domain.model.ShopItem
import com.noa.tamagotchi.ui.state.NoaUiState
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharedFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asSharedFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.collectLatest
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import kotlin.time.Duration.Companion.minutes

class NoaViewModel(private val repository: NoaRepository) : ViewModel() {

    private val _uiState = MutableStateFlow(NoaUiState())
    val uiState: StateFlow<NoaUiState> = _uiState.asStateFlow()

    private val _events = MutableSharedFlow<String>(extraBufferCapacity = 4)
    val events: SharedFlow<String> = _events.asSharedFlow()

    private var tickerJob: Job? = null

    init {
        observeState()
        startTicker()
    }

    private fun observeState() {
        viewModelScope.launch {
            repository.noaState.collectLatest { state ->
                val alerts = buildAlerts(state)
                val dailyAvailable = isDailyRewardAvailable(state)
                _uiState.update {
                    it.copy(
                        isLoading = false,
                        noaState = state,
                        alerts = alerts,
                        availableItems = repository.availableShopItems(),
                        miniGames = repository.miniGames(),
                        dailyRewardAvailable = dailyAvailable
                    )
                }
            }
        }
    }

    private fun startTicker() {
        tickerJob?.cancel()
        tickerJob = viewModelScope.launch {
            while (true) {
                delay(1.minutes)
                val updated = repository.refreshState()
                val alerts = buildAlerts(updated)
                _uiState.update {
                    it.copy(
                        noaState = updated,
                        alerts = alerts,
                        dailyRewardAvailable = isDailyRewardAvailable(updated)
                    )
                }
            }
        }
    }

    fun onAction(action: GameAction) {
        viewModelScope.launch {
            val result = repository.performAction(action)
            result.message?.let { _events.emit(it) }
            val alerts = buildAlerts(result.state)
            _uiState.update {
                it.copy(
                    noaState = result.state,
                    alerts = alerts,
                    dailyRewardAvailable = isDailyRewardAvailable(result.state)
                )
            }
        }
    }

    fun onPurchase(item: ShopItem) {
        viewModelScope.launch {
            val result = repository.purchase(item)
            result.message?.let { _events.emit(it) }
            _uiState.update { it.copy(noaState = result.state) }
        }
    }

    fun onUseItem(item: ShopItem) {
        viewModelScope.launch {
            val result = repository.useItem(item)
            result.message?.let { _events.emit(it) }
            val alerts = buildAlerts(result.state)
            _uiState.update {
                it.copy(
                    noaState = result.state,
                    alerts = alerts,
                    dailyRewardAvailable = isDailyRewardAvailable(result.state)
                )
            }
        }
    }

    fun onMiniGameCompleted(miniGameId: String) {
        viewModelScope.launch {
            repository.miniGames().firstOrNull { it.id == miniGameId }?.let { miniGame ->
                val result = repository.rewardFromMiniGame(miniGame)
                result.message?.let { _events.emit(it) }
                _uiState.update { it.copy(noaState = result.state) }
            }
        }
    }

    fun onClaimDailyReward() {
        viewModelScope.launch {
            val result = repository.claimDailyReward()
            result.message?.let { _events.emit(it) }
            _uiState.update {
                it.copy(
                    noaState = result.state,
                    dailyRewardAvailable = isDailyRewardAvailable(result.state)
                )
            }
        }
    }

    private fun buildAlerts(state: com.noa.tamagotchi.domain.model.NoaState): List<String> = buildList {
        if (state.hunger < 40) add("Noa tiene hambre")
        if (state.sleep < 40) add("Noa necesita dormir")
        if (state.happiness < 40) add("Noa quiere jugar")
        if (state.energy < 30) add("Noa está cansado")
        if (state.health < 30) add("Noa necesita cuidados")
    }

    private fun isDailyRewardAvailable(state: com.noa.tamagotchi.domain.model.NoaState): Boolean {
        val now = System.currentTimeMillis()
        val dayMillis = 24 * 60 * 60 * 1000L
        return now - state.lastDailyReward >= dayMillis
    }

    override fun onCleared() {
        super.onCleared()
        tickerJob?.cancel()
    }

    companion object {
        fun factory(repository: NoaRepository): ViewModelProvider.Factory =
            object : ViewModelProvider.Factory {
                @Suppress("UNCHECKED_CAST")
                override fun <T : ViewModel> create(modelClass: Class<T>): T {
                    if (modelClass.isAssignableFrom(NoaViewModel::class.java)) {
                        return NoaViewModel(repository) as T
                    }
                    throw IllegalArgumentException("Unknown ViewModel class")
                }
            }
    }
}
