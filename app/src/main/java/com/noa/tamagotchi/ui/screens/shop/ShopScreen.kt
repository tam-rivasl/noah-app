package com.noa.tamagotchi.ui.screens.shop

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.noa.tamagotchi.domain.model.ShopItem
import com.noa.tamagotchi.ui.state.NoaUiState

@Composable
fun ShopScreen(
    uiState: NoaUiState,
    onBack: () -> Unit,
    onPurchase: (ShopItem) -> Unit,
    onUseItem: (ShopItem) -> Unit
) {
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text(text = "Tienda de Noa") },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(imageVector = Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Volver")
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = MaterialTheme.colorScheme.surface)
            )
        }
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .padding(paddingValues)
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            Text(
                text = "Monedas disponibles: ${uiState.noaState.coins}",
                style = MaterialTheme.typography.titleMedium
            )
            LazyColumn(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                items(uiState.availableItems) { item ->
                    ShopItemCard(
                        item = item,
                        quantity = uiState.noaState.inventory[item.id] ?: 0,
                        onPurchase = { onPurchase(item) },
                        onUse = { onUseItem(item) }
                    )
                }
            }
        }
    }
}

@Composable
fun ShopItemCard(
    item: ShopItem,
    quantity: Int,
    onPurchase: () -> Unit,
    onUse: () -> Unit
) {
    Card(colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)) {
        Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            Text(text = item.name, style = MaterialTheme.typography.titleMedium)
            Text(text = item.description, style = MaterialTheme.typography.bodyMedium)
            Text(text = "Precio: ${item.price} monedas", style = MaterialTheme.typography.bodyMedium)
            Text(text = "Inventario: $quantity", style = MaterialTheme.typography.bodyMedium)
            Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                Button(onClick = onPurchase, enabled = true, shape = MaterialTheme.shapes.small) {
                    Text(text = "Comprar")
                }
                Button(onClick = onUse, enabled = quantity > 0, shape = MaterialTheme.shapes.small) {
                    Text(text = "Usar")
                }
            }
        }
    }
}
