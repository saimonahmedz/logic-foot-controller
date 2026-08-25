import SwiftUI

public struct BankManagerView: View {
    @State private var banks: [Bank]
    @State private var selectedBankId: UUID
    @State private var showingAddBankSheet: Bool = false
    @State private var newBankName: String = ""
    @State private var newBankDescription: String = ""
    
    private let onSelectBank: (Bank) -> Void
    private let onBanksChanged: ([Bank]) -> Void
    
    public init(
        banks: [Bank],
        activeBankId: UUID,
        onSelectBank: @escaping (Bank) -> Void,
        onBanksChanged: @escaping ([Bank]) -> Void
    ) {
        _banks = State(initialValue: banks)
        _selectedBankId = State(initialValue: activeBankId)
        self.onSelectBank = onSelectBank
        self.onBanksChanged = onBanksChanged
    }
    
    public var body: some View {
        List {
            Section(header: Text("AVAILABLE BANKS (\(banks.count))").font(.caption).bold()) {
                ForEach(banks) { bank in
                    HStack {
                        Circle()
                            .fill(Color(hex: bank.colorTag) ?? .blue)
                            .frame(width: 10, height: 10)
                        
                        VStack(alignment: .leading, spacing: 2) {
                            Text(bank.name)
                                .font(.headline)
                                .foregroundColor(bank.id == selectedBankId ? .blue : .primary)
                            
                            if !bank.description.isEmpty {
                                Text(bank.description)
                                    .font(.caption)
                                    .foregroundColor(.gray)
                            }
                        }
                        
                        Spacer()
                        
                        if bank.id == selectedBankId {
                            Image(systemName: "checkmark.circle.fill")
                                .foregroundColor(.blue)
                        }
                    }
                    .contentShape(Rectangle())
                    .onTapGesture {
                        selectedBankId = bank.id
                        onSelectBank(bank)
                    }
                    .swipeActions(edge: .trailing) {
                        if banks.count > 1 {
                            Button(role: .destructive) {
                                deleteBank(bank)
                            } label: {
                                Label("Delete", systemImage: "trash")
                            }
                        }
                        
                        Button {
                            duplicateBank(bank)
                        } label: {
                            Label("Duplicate", systemImage: "plus.square.on.square")
                        }
                        .tint(.indigo)
                    }
                }
            }
        }
        .navigationTitle("Bank Manager")
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .primaryAction) {
                Button(action: { showingAddBankSheet = true }) {
                    Image(systemName: "plus")
                }
            }
        }
        .sheet(isPresented: $showingAddBankSheet) {
            NavigationView {
                Form {
                    Section(header: Text("NEW BANK")) {
                        TextField("Bank Name (e.g. ACOUSTIC / METAL)", text: $newBankName)
                        TextField("Description (optional)", text: $newBankDescription)
                    }
                }
                .navigationTitle("Create Bank")
                .navigationBarTitleDisplayMode(.inline)
                .toolbar {
                    ToolbarItem(placement: .cancellationAction) {
                        Button("Cancel") { showingAddBankSheet = false }
                    }
                    ToolbarItem(placement: .confirmationAction) {
                        Button("Create") {
                            createBank()
                            showingAddBankSheet = false
                        }
                        .disabled(newBankName.trimmingCharacters(in: .whitespaces).isEmpty)
                    }
                }
            }
        }
    }
    
    private func createBank() {
        let name = newBankName.trimmingCharacters(in: .whitespaces).uppercased()
        guard !name.isEmpty else { return }
        let newBank = Bank(
            name: name,
            description: newBankDescription,
            switches: FootswitchConfig.defaultEightSwitches(),
            colorTag: "#3B82F6"
        )
        banks.append(newBank)
        onBanksChanged(banks)
        newBankName = ""
        newBankDescription = ""
    }
    
    private func duplicateBank(_ bank: Bank) {
        let copy = Bank(
            name: "\(bank.name) (COPY)",
            description: bank.description,
            switches: bank.switches,
            colorTag: bank.colorTag
        )
        banks.append(copy)
        onBanksChanged(banks)
    }
    
    private func deleteBank(_ bank: Bank) {
        guard banks.count > 1 else { return }
        banks.removeAll(where: { $0.id == bank.id })
        if selectedBankId == bank.id, let first = banks.first {
            selectedBankId = first.id
            onSelectBank(first)
        }
        onBanksChanged(banks)
    }
}
