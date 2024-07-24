# Минимальная версия CMake
cmake_minimum_required(VERSION 3.10.2)

# Название вашего проекта
project("RSecktor")

# Указание директорий с заголовочными файлами
include_directories(libnode/include/node/)

# Добавление импортированной библиотеки libnode
add_library(libnode
            SHARED
            IMPORTED)

# Указание свойств для импортированной библиотеки
set_target_properties(libnode
                      PROPERTIES IMPORTED_LOCATION
                      ${CMAKE_SOURCE_DIR}/libnode/bin/${ANDROID_ABI}/libnode.so)

# Добавление вашей нативной библиотеки native-lib
add_library(native-lib
            SHARED
            src/main/cpp/native-lib.cpp)  # Убедитесь, что путь к вашему cpp файлу правильный

# Нахождение библиотеки log
find_library(log-lib
             log)

# Линковка библиотек
target_link_libraries(native-lib
                      libnode
                      ${log-lib})
