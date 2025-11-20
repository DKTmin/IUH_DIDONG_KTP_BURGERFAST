// Danh sách địa chỉ gợi ý ở Việt Nam
export const addressSuggestions = [
  // Quận 1, TP HCM
  "123 Đường Nguyễn Huệ, Quận 1, TP HCM",
  "456 Đường Lê Duẩn, Quận 1, TP HCM",
  "789 Đường Độc Lập, Quận 1, TP HCM",
  "101 Đường Hàm Nghi, Quận 1, TP HCM",

  // Quận 3, TP HCM
  "234 Đường Ba Tháng Hai, Quận 3, TP HCM",
  "567 Đường Lý Tự Trọng, Quận 3, TP HCM",
  "890 Đường Võ Văn Tần, Quận 3, TP HCM",

  // Quận 5, TP HCM
  "111 Đường Nguyễn Trãi, Quận 5, TP HCM",
  "222 Đường Châu Văn Liêm, Quận 5, TP HCM",
  "333 Đường An Dương Vương, Quận 5, TP HCM",

  // Quận 7, TP HCM
  "444 Đường Nguyễn Hữu Cảnh, Quận 7, TP HCM",
  "555 Đường Ngô Tất Tố, Quận 7, TP HCM",
  "666 Đường Hoàng Anh, Quận 7, TP HCM",

  // Quận Bình Thạnh
  "777 Đường Điện Biên Phủ, Quận Bình Thạnh, TP HCM",
  "888 Đường Pasteur, Quận Bình Thạnh, TP HCM",
  "999 Đường Võ Văn Kiệt, Quận Bình Thạnh, TP HCM",

  // Quận Tân Bình
  "1010 Đường Cộng Hòa, Quận Tân Bình, TP HCM",
  "1111 Đường Sư Vạn Hạnh, Quận Tân Bình, TP HCM",
  "1212 Đường Hoàng Văn Thụ, Quận Tân Bình, TP HCM",

  // Quận Thủ Đức
  "1313 Đường Lê Văn Việt, Quận Thủ Đức, TP HCM",
  "1414 Đường Lê Viết Dũng, Quận Thủ Đức, TP HCM",
  "1515 Đường Trường Chinh, Quận Thủ Đức, TP HCM",

  // Quận 12
  "1616 Đường Lê Thị Riêng, Quận 12, TP HCM",
  "1717 Đường Hương Lộ 2, Quận 12, TP HCM",
  "1818 Đường Trần Văn Giàu, Quận 12, TP HCM",

  // Quận Phú Nhuận
  "1919 Đường Thụy Khuê, Quận Phú Nhuận, TP HCM",
  "2020 Đường Nguyễn Văn Huyên, Quận Phú Nhuận, TP HCM",
  "2121 Đường Cách Mạng Tháng 8, Quận Phú Nhuận, TP HCM",

  // Quận Gò Vấp
  "2222 Đường Lê Lợi, Quận Gò Vấp, TP HCM",
  "2323 Đường Hùng Vương, Quận Gò Vấp, TP HCM",
  "2424 Đường Trần Hưng Đạo, Quận Gò Vấp, TP HCM",

  // Hà Nội
  "2525 Đường Trần Hưng Đạo, Hoàn Kiếm, Hà Nội",
  "2626 Đường Hàng Buồm, Hoàn Kiếm, Hà Nội",
  "2727 Đường Lý Thái Tổ, Hoàn Kiếm, Hà Nội",

  // Quận Ba Đình, Hà Nội
  "2828 Đường Phan Chu Trinh, Quận Ba Đình, Hà Nội",
  "2929 Đường Đinh Tiên Hoàng, Quận Ba Đình, Hà Nội",
  "3030 Đường Hàng Chuối, Quận Ba Đình, Hà Nội",

  // Đà Nẵng
  "3131 Đường Hàng Vuông, Hải Châu, Đà Nẵng",
  "3232 Đường Nguyễn Văn Linh, Hải Châu, Đà Nẵng",
  "3333 Đường Trần Phú, Thanh Khê, Đà Nẵng",

  // Hải Phòng
  "3434 Đường Lạch Tray, Hồng Bàng, Hải Phòng",
  "3535 Đường Lê Hồng Phong, Ngô Quyền, Hải Phòng",
  "3636 Đường Trần Hưng Đạo, Hải An, Hải Phòng",

  // Cần Thơ
  "3737 Đường Hàm Tử Ngư, Quận 1, Cần Thơ",
  "3838 Đường Lý Tự Trọng, Quận 1, Cần Thơ",
  "3939 Đường Mạc Thiên Tích, Quận 5, Cần Thơ",
];

/**
 * Lọc danh sách địa chỉ gợi ý dựa trên văn bản nhập vào
 * @param searchText - Văn bản tìm kiếm
 * @returns Danh sách địa chỉ phù hợp (tối đa 5 kết quả)
 */
export function getAddressSuggestions(searchText: string): string[] {
  if (!searchText || searchText.trim().length === 0) {
    return [];
  }

  const lowerSearch = searchText.toLowerCase().trim();

  // Lọc địa chỉ chứa text tìm kiếm
  const filtered = addressSuggestions.filter((address) =>
    address.toLowerCase().includes(lowerSearch)
  );

  // Ưu tiên những địa chỉ bắt đầu với text tìm kiếm
  const prioritized = filtered.sort((a, b) => {
    const aStartsWith = a.toLowerCase().startsWith(lowerSearch);
    const bStartsWith = b.toLowerCase().startsWith(lowerSearch);

    if (aStartsWith && !bStartsWith) return -1;
    if (!aStartsWith && bStartsWith) return 1;
    return 0;
  });

  // Trả về tối đa 5 kết quả
  return prioritized.slice(0, 5);
}
