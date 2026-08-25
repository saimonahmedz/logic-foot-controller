import Foundation

public struct Preset: Identifiable, Codable, Equatable {
    public var id: UUID
    public var name: String
    public var details: String
    public var banks: [Bank]
    public var defaultBankId: UUID
    public var createdAt: Date
    public var updatedAt: Date
    
    public init(
        id: UUID = UUID(),
        name: String,
        details: String = "",
        banks: [Bank] = Bank.defaultBanks(),
        defaultBankId: UUID? = nil,
        createdAt: Date = Date(),
        updatedAt: Date = Date()
    ) {
        self.id = id
        self.name = name
        self.details = details
        self.banks = banks.isEmpty ? Bank.defaultBanks() : banks
        self.defaultBankId = defaultBankId ?? (self.banks.first?.id ?? UUID())
        self.createdAt = createdAt
        self.updatedAt = updatedAt
    }
    
    public static func defaultPreset() -> Preset {
        let banks = Bank.defaultBanks()
        return Preset(
            name: "ROCK LIVE SET",
            details: "Default live performance rig with 5 tuned banks for arena rock and worship sets",
            banks: banks,
            defaultBankId: banks.first?.id
        )
    }
}
