package com.ithc.voluntarioserca.historial;

import java.util.Map;
import java.util.Optional;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ithc.voluntarioserca.auth.User;
import com.ithc.voluntarioserca.auth.UserRepository;

@RestController
@RequestMapping("/api/historial")
@CrossOrigin(originPatterns = "${app.frontend-url}")
public class HistorialController {

    private final HistorialService historialService;
    private final UserRepository userRepository;

    public HistorialController(HistorialService historialService, UserRepository userRepository) {
        this.historialService = historialService;
        this.userRepository = userRepository;
    }

    // El usuario sale del token: nadie puede pedir el historial de otra persona
    @GetMapping
    public ResponseEntity<?> listar(@RequestHeader(value = "Authorization", required = false) String header) {
        Optional<User> user = findByHeader(header);
        if (user.isEmpty()) {
            return ResponseEntity.status(401).body(Map.of("message", "Sesión inválida"));
        }
        return ResponseEntity.ok(historialService.listar(user.get()));
    }

    private Optional<User> findByHeader(String header) {
        if (header == null || !header.startsWith("Bearer ")) {
            return Optional.empty();
        }
        return userRepository.findByToken(header.substring(7));
    }
}
