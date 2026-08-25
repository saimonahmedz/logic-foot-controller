import Foundation
import SwiftUI

public final class BankManagerViewModel: ObservableObject {
    @Published public var banks: [Bank]
    @Published public var selectedBankId: UUID
    @Published public var newBankName: String = ""
    @Published public var newBankDescription: String = ""
    @Published public var isPresentingNewBankDialog: Bool = false
    
    private let onBankUpdated: ([Bank]) -> Void
    
    public init(banks: [Bank], activeBankId: UUID, onBankUpdated: @escaping ([Bank]) -> Void) {
        self.banks = banks
        self.selectedBankId = activeBankId
        self.onBankUpdated = onBankUpdated
    }
    
    public func createBank(name: String, description: String = "") {
        let trimmed = name.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !trimmed.isEmpty else { return }
        
        let newBank = Bank(
            name: trimmed.uppercased(),
            description: description,
            switches: FootswitchConfig.defaultEightSwitches()
        )
        banks.append(newBank)
        selectedBankId = newBank.id
        onBankUpdated(banks)
    }
    
    public func duplicateBank(_ bank: Bank) {
        let copy = Bank(
            name: "\(bank.name) (COPY)",
            description: bank.description,
            switches: bank.switches,
            colorTag: bank.colorTag
        )
        banks.append(copy)
        onBankUpdated(banks)
    }
    
    public func deleteBank(_ bank: Bank) {
        guard banks.count > 1 else { return } // Keep at least one bank
        banks.removeAll(where: { $0.id == bank.id })
        if selectedBankId == bank.id {
            selectedBankId = banks.first?.id ?? UUID()
        }
        onBankUpdated(banks)
    }
    
    public func renameBank(bank: Bank, newName: String) {
        guard let index = banks.firstIndex(where: { $0.id == bank.id }) else { return }
        banks[index].name = newName.trimmingCharacters(in: .whitespacesAndNewlines).uppercased()
        banks[index].updatedAt = Date()
        onBankUpdated(banks)
    }
}
