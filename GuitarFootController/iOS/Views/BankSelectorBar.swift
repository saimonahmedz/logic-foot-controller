import SwiftUI

public struct BankSelectorBar: View {
    @ObservedObject var viewModel: ControllerViewModel
    
    public var body: some View {
        HStack(spacing: 8) {
            // Bank Navigation Label
            Text("BANKS:")
                .font(.system(size: 11, weight: .black, design: .monospaced))
                .foregroundColor(.gray)
                .padding(.leading, 8)
            
            // Scrollable Bank Badges
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 6) {
                    ForEach(viewModel.activePreset.banks) { bank in
                        let isSelected = bank.id == viewModel.activeBank.id
                        
                        Button(action: {
                            viewModel.selectBank(bank)
                        }) {
                            HStack(spacing: 6) {
                                Circle()
                                    .fill(Color(hex: bank.colorTag) ?? .blue)
                                    .frame(width: 8, height: 8)
                                
                                Text(bank.name)
                                    .font(.system(size: 12, weight: .black, design: .rounded))
                                    .foregroundColor(isSelected ? .white : .gray)
                            }
                            .padding(.horizontal, 14)
                            .padding(.vertical, 8)
                            .background(
                                RoundedRectangle(cornerRadius: 8)
                                    .fill(isSelected ? Color(hex: "#262E3D")! : Color(hex: "#14171E")!)
                                    .overlay(
                                        RoundedRectangle(cornerRadius: 8)
                                            .stroke(isSelected ? (Color(hex: bank.colorTag) ?? .blue) : Color.white.opacity(0.08), lineWidth: 1.5)
                                    )
                            )
                        }
                        .buttonStyle(PlainButtonStyle())
                    }
                }
                .padding(.vertical, 4)
            }
            
            Spacer()
            
            // Bank Manager Button
            Button(action: {
                viewModel.showingBankPickerSheet = true
            }) {
                HStack(spacing: 4) {
                    Image(systemName: "square.grid.2x2")
                        .font(.system(size: 11, weight: .bold))
                    Text("MANAGE")
                        .font(.system(size: 10, weight: .bold, design: .monospaced))
                }
                .foregroundColor(.white)
                .padding(.horizontal, 10)
                .padding(.vertical, 7)
                .background(Color.white.opacity(0.12))
                .cornerRadius(6)
            }
            .padding(.trailing, 8)
        }
        .padding(.horizontal, 8)
        .padding(.vertical, 4)
        .background(Color(hex: "#0B0E13"))
    }
}
