package com.noa.tamagotchi.data

import android.content.Context
import androidx.datastore.core.DataStore
import androidx.datastore.core.DataStoreFactory
import androidx.datastore.dataStoreFile
import com.noa.tamagotchi.domain.model.TamagotchiSnapshot
import java.io.IOException
import kotlinx.coroutines.CoroutineDispatcher
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.catch
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.withContext

interface TamagotchiStateDataSource {
    val snapshotFlow: Flow<TamagotchiSnapshot>
    suspend fun read(): TamagotchiSnapshot
    suspend fun update(transform: (TamagotchiSnapshot) -> TamagotchiSnapshot): TamagotchiSnapshot
}

class TamagotchiPreferencesDataSource internal constructor(
    private val dataStore: DataStore<TamagotchiSnapshot>,
    private val ioDispatcher: CoroutineDispatcher = Dispatchers.IO
) : TamagotchiStateDataSource {

    override val snapshotFlow: Flow<TamagotchiSnapshot> = dataStore.data
        .catch { throwable ->
            if (throwable is IOException) {
                emit(TamagotchiSnapshot())
            } else {
                throw throwable
            }
        }

    override suspend fun read(): TamagotchiSnapshot = withContext(ioDispatcher) {
        dataStore.data.first()
    }

    override suspend fun update(transform: (TamagotchiSnapshot) -> TamagotchiSnapshot): TamagotchiSnapshot =
        withContext(ioDispatcher) {
            dataStore.updateData { current -> transform(current) }
        }

    companion object {
        private const val DEFAULT_DATA_FILE_NAME = "noa_tamagotchi.json"
        private const val ENV_DATA_FILE = "NOA_DATASTORE_FILE"

        fun fromContext(context: Context): TamagotchiPreferencesDataSource {
            val fileName = System.getenv(ENV_DATA_FILE)?.takeIf { it.isNotBlank() }
                ?: DEFAULT_DATA_FILE_NAME
            val store = DataStoreFactory.create(
                serializer = TamagotchiSnapshotSerializer,
                produceFile = { context.dataStoreFile(fileName) }
            )
            return TamagotchiPreferencesDataSource(store)
        }
    }
}

internal object TamagotchiSnapshotSerializer : androidx.datastore.core.Serializer<TamagotchiSnapshot> {
    private val json = kotlinx.serialization.json.Json {
        prettyPrint = false
        ignoreUnknownKeys = true
    }

    override val defaultValue: TamagotchiSnapshot = TamagotchiSnapshot()

    override suspend fun readFrom(input: java.io.InputStream): TamagotchiSnapshot =
        runCatching {
            input.readBytes().decodeToString().takeIf { it.isNotBlank() }?.let {
                json.decodeFromString(TamagotchiSnapshot.serializer(), it)
            }
        }.getOrNull() ?: defaultValue

    override suspend fun writeTo(t: TamagotchiSnapshot, output: java.io.OutputStream) {
        output.use { stream ->
            val encoded = json.encodeToString(TamagotchiSnapshot.serializer(), t)
            stream.write(encoded.toByteArray())
        }
    }
}
