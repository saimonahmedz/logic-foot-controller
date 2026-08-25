import SwiftUI

public struct MainControllerView: View {
    @StateObject private var viewModel = ControllerViewModel()
    
    // 4 columns on top row, 4 columns on bottom row for standard 8-switch landscape pedalboard
    private let columns = [
        GridItem(.flexible(), spacing: 12),
        GridItem(.flexible(), spacing: 12),
        GridItem(.flexible(), spacing: 12),
        GridItem(.flexible(), spacing: 12)
    ]
    
    public init() {}
    
    public var body: some View {
        ZStack {
            // Stage dark background
            Color(hex: "#090B0E")
                .ignoresSafeArea()
            
            VStack(spacing: 0) {
                // Top Status and Connectivity Header
                TopStatusBar(viewModel: viewModel)
                
                // Bank Quick-Selector Navigation Bar
                BankSelectorBar(viewModel: viewModel)
                
                Divider()
                    .background(Color.white.opacity(0.1))
                
                // 8 Large Footswitches Grid (4x2 Landscape)
                GeometryReader { geometry in
                    let availableHeight = geometry.size.height - 16
                    let cardHeight = max(110, (availableHeight - 12) / 2)
                    
                    LazyVGrid(columns: columns, spacing: 12) {
                        ForEach(0..<8, id: \.self) { index in
                            if index < viewModel.activeBank.switches.count {
                                let config = viewModel.activeBank.switches[index]
                                
                                FootswitchButtonView(
                                    config: config,
                                    isOn: viewModel.switchOnStates[index],
                                    isPressed: viewModel.switchPressedStates[index],
                                    isHighContrast: viewModel.appSettings.highContrastMode,
                                    showSubLabel: viewModel.appSettings.showSubLabels,
                                    onPressDown: {
                                        viewModel.handleSwitchPressDown(index: index)
                                    },
                                    onPressUp: {
                                        viewModel.handleSwitchPressUp(index: index)
                                    },
                                    onConfigure: {
                                        viewModel.editingSwitchIndex = index
                                    }
                                )
                                .frame(height: cardHeight)
                            }
                        }
                    }
                    .padding(12)
                }
            }
        }
        .sheet(item: Binding(
            get: { viewModel.editingSwitchIndex != nil ? IdentifiableIndex(index: viewModel.editingSwitchIndex!) : nil },
            set: { viewModel.editingSwitchIndex = $0?.index }
        )) { item in
            if item.index < viewModel.activeBank.switches.count {
                SwitchConfigView(
                    config: viewModel.activeBank.switches[item.index],
                    onSave: { updated in
                        viewModel.updateSwitchConfig(updated)
                        viewModel.editingSwitchIndex = nil
                    },
                    onDismiss: {
                        viewModel.editingSwitchIndex = nil
                    }
                )
            }
        }
        .sheet(isPresented: $viewModel.showingSettingsSheet) {
            SettingsView(viewModel: viewModel)
        }
        .sheet(isPresented: $viewModel.showingBankPickerSheet) {
            BankManagerView(
                banks: viewModel.activePreset.banks,
                activeBankId: viewModel.activeBank.id,
                onSelectBank: { selected in
                    viewModel.selectBank(selected)
                    viewModel.showingBankPickerSheet = false
                },
                onBanksChanged: { updatedBanks in
                    viewModel.activePreset.banks = updatedBanks
                    viewModel.saveState()
                }
            )
        }
    }
}

public struct IdentifiableIndex: Identifiable {
    public var id: Int { index }
    public let index: Int
}
