package com.noa.tamagotchi.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import com.noa.tamagotchi.data.TamagotchiRepository
import com.noa.tamagotchi.domain.model.TamagotchiAction
import com.noa.tamagotchi.ui.state.NoaUiState
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.collectLatest
import kotlinx.coroutines.launch

class NoaViewModel(private val repository: TamagotchiRepository) : ViewModel() {

    private val _uiState = MutableStateFlow(NoaUiState())
    val uiState: StateFlow<NoaUiState> = _uiState

    init {
        observeRepository()
    }

    fun refresh() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true)
            val state = repository.refresh()
            _uiState.value = NoaUiState(isLoading = false, state = state)
        }
    }

    fun onAction(action: TamagotchiAction) {
        viewModelScope.launch {
            val state = repository.applyAction(action)
            _uiState.value = NoaUiState(isLoading = false, state = state)
        }
    }

    fun onDailyReward() {
        viewModelScope.launch {
            val state = repository.rewardDailyCoins()
            _uiState.value = NoaUiState(isLoading = false, state = state)
        }
    }

    private fun observeRepository() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true)
            repository.state.collectLatest { state ->
                _uiState.value = NoaUiState(isLoading = false, state = state)
            }
        }
    }

    companion object {
        fun factory(repository: TamagotchiRepository): ViewModelProvider.Factory =
            object : ViewModelProvider.Factory {
                override fun <T : ViewModel> create(modelClass: Class<T>): T {
                    if (modelClass.isAssignableFrom(NoaViewModel::class.java)) {
                        @Suppress("UNCHECKED_CAST")
                        return NoaViewModel(repository) as T
                    }
                    throw IllegalArgumentException("Unknown ViewModel class")
                }
            }
    }
}
