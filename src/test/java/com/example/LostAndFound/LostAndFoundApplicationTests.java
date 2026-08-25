package com.example.LostAndFound;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest(properties = "spring.main.lazy-initialization=true")
@ActiveProfiles("test")
class LostAndFoundApplicationTests {

	@Test
	void contextLoads() {
	}

}
