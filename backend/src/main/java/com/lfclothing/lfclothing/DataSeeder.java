package com.lfclothing.lfclothing;

import com.lfclothing.lfclothing.model.Categoria;
import com.lfclothing.lfclothing.model.Produto;
import com.lfclothing.lfclothing.repository.CategoriaRepository;
import com.lfclothing.lfclothing.repository.ProdutoRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.Map;

@Configuration
public class DataSeeder {

    @Bean
    CommandLineRunner initProdutos(ProdutoRepository repository, CategoriaRepository categoriaRepository) {
        return args -> {
            // Seed categorias padrão se não existirem
            if (categoriaRepository.count() == 0) {
                categoriaRepository.saveAll(Arrays.asList(
                    new Categoria("Camisetas", "/img/produtos/IMG_0683.jpg", 1),
                    new Categoria("Polos", "/img/produtos/IMG_9501.jpg", 2),
                    new Categoria("Jaquetas", "/img/jaqueta-preta.jpg", 3),
                    new Categoria("Shorts", "/img/produtos/IMG_0249.JPG.jpeg", 4),
                    new Categoria("Bonés", "/img/produtos/IMG_0370.PNG", 5)
                ));
                System.out.println("Categorias padrão inseridas com sucesso!");
            }

            boolean jaTemOriginais = repository.findAll().stream()
                    .anyMatch(p -> p.getNome().contains("Camiseta Classic Areia"));

            if (!jaTemOriginais) {
                Produto p1 = new Produto("Camiseta Classic Areia", "Camiseta com caimento perfeito, desenvolvida em algodão premium com toque super macio. Ideal para o dia a dia e composições minimalistas. Logo LF discreto no peito.", "Camisetas", new BigDecimal("89.90"), "/img/camiseta-bege.jpg", 0);
                p1.setEstoqueTamanhos(new LinkedHashMap<>(Map.of("P", 25, "M", 25, "G", 25, "GG", 25)));

                Produto p2 = new Produto("Jaqueta Bomber Azul Marinho", "Jaqueta leve e versátil com fechamento em zíper frontal. Ideal para meia-estação, contando com acabamento impecável, bolsos laterais e punhos ajustados.", "Jaquetas", new BigDecimal("249.90"), "/img/jaqueta-azul.jpg", 0);
                p2.setEstoqueTamanhos(new LinkedHashMap<>(Map.of("P", 16, "M", 17, "G", 17)));

                Produto p3 = new Produto("Jaqueta Bomber Premium Areia", "Elevando o look casual, esta jaqueta na cor areia garante proteção térmica sem perder o toque moderno. Confeccionada em tecido tecnológico resistente a ventos.", "Jaquetas", new BigDecimal("249.90"), "/img/jaqueta-bege.jpg", 0);
                p3.setEstoqueTamanhos(new LinkedHashMap<>(Map.of("M", 10, "G", 10, "GG", 10)));

                Produto p4 = new Produto("Jaqueta Bomber Clássica Preta", "A clássica preta infalível. Curinga no guarda-roupa masculino, muito confortável tanto aberta sobre camisetas brancas, quanto fechada para dias gelados.", "Jaquetas", new BigDecimal("249.90"), "/img/jaqueta-preta.jpg", 0);
                p4.setEstoqueTamanhos(new LinkedHashMap<>(Map.of("P", 17, "M", 18, "G", 18, "GG", 17)));

                repository.saveAll(Arrays.asList(p1, p2, p3, p4));
                System.out.println("Coleção Original LF inserida com sucesso no banco vazio!");
            }
        };
    }
}
