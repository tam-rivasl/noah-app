package com.noa.tamagotchi.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

/**
 * Simple state holder that exposes Noa's activity and orchestrates timed transitions.
 */
class NoaViewModel : ViewModel() {

    private val _state = MutableStateFlow(NoaState.WALKING)
    val state: StateFlow<NoaState> = _state.asStateFlow()

    private var feedJob: Job? = null

    /**
     * Forces Noa back into the walking loop, cancelling any ongoing animation jobs.
     */
    fun walk() {
        feedJob?.cancel()
        feedJob = null
        _state.value = NoaState.WALKING
    }

    /**
     * Triggers the eating animation for [FEEDING_DURATION_MS] before returning to walking.
     * If Noa is sleeping the request is ignored until she wakes up via [walk].
     */
    fun feed() {
        if (_state.value == NoaState.SLEEPING) {
            return
        }
        feedJob?.cancel()
        feedJob = viewModelScope.launch {
            try {
                _state.value = NoaState.EATING
                delay(FEEDING_DURATION_MS)
                _state.value = NoaState.WALKING
            } finally {
                feedJob = null
            }
        }
    }

    /**
     * Puts Noa to sleep until the user explicitly requests [walk].
     */
    fun sleep() {
        feedJob?.cancel()
        feedJob = null
        _state.value = NoaState.SLEEPING
    }

    private companion object {
        const val FEEDING_DURATION_MS = 2_500L
    }
}
