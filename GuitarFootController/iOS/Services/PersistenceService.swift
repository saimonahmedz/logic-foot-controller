import Foundation

public final class PersistenceService {
    public static let shared = PersistenceService()
    
    private let fileManager = FileManager.default
    private let presetsFileName = "presets_v1.json"
    private let activePresetIdKey = "active_preset_id_v1"
    private let appSettingsFileName = "app_settings_v1.json"
    
    private var appSupportDirectory: URL {
        let urls = fileManager.urls(for: .applicationSupportDirectory, in: .userDomainMask)
        let dir = urls[0].appendingPathComponent("GuitarFootController", isDirectory: true)
        if !fileManager.fileExists(atPath: dir.path) {
            try? fileManager.createDirectory(at: dir, withIntermediateDirectories: true)
        }
        return dir
    }
    
    private init() {}
    
    // MARK: - Presets Storage
    
    public func loadPresets() -> [Preset] {
        let fileURL = appSupportDirectory.appendingPathComponent(presetsFileName)
        guard fileManager.fileExists(atPath: fileURL.path),
              let data = try? Data(contentsOf: fileURL),
              let presets = try? JSONDecoder().decode([Preset].self, from: data),
              !presets.isEmpty else {
            let defaultPreset = Preset.defaultPreset()
            savePresets([defaultPreset])
            return [defaultPreset]
        }
        return presets
    }
    
    public func savePresets(_ presets: [Preset]) {
        let fileURL = appSupportDirectory.appendingPathComponent(presetsFileName)
        guard let data = try? JSONEncoder().encode(presets) else { return }
        try? data.write(to: fileURL, options: .atomic)
    }
    
    // MARK: - Active Selection
    
    public func loadActivePresetId() -> UUID? {
        if let idString = UserDefaults.standard.string(forKey: activePresetIdKey) {
            return UUID(uuidString: idString)
        }
        return nil
    }
    
    public func saveActivePresetId(_ id: UUID) {
        UserDefaults.standard.set(id.uuidString, forKey: activePresetIdKey)
    }
    
    // MARK: - Settings Storage
    
    public func loadSettings() -> AppSettings {
        let fileURL = appSupportDirectory.appendingPathComponent(appSettingsFileName)
        guard fileManager.fileExists(atPath: fileURL.path),
              let data = try? Data(contentsOf: fileURL),
              let settings = try? JSONDecoder().decode(AppSettings.self, from: data) else {
            let defaultSettings = AppSettings()
            saveSettings(defaultSettings)
            return defaultSettings
        }
        return settings
    }
    
    public func saveSettings(_ settings: AppSettings) {
        let fileURL = appSupportDirectory.appendingPathComponent(appSettingsFileName)
        guard let data = try? JSONEncoder().encode(settings) else { return }
        try? data.write(to: fileURL, options: .atomic)
    }
}
