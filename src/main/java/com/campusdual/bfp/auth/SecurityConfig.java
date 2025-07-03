package com.campusdual.bfp.auth;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableGlobalMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@EnableGlobalMethodSecurity(prePostEnabled = true)
public class SecurityConfig {

    @Autowired
    private AuthEntryPointJwt authEntryPointJwt;

    @Bean
    public AuthJWTTokenFilter authenticationJwtTokenFilter() {
        return new AuthJWTTokenFilter();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration) throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .cors().and()
                .csrf().disable()
                .exceptionHandling()
                .authenticationEntryPoint(this.authEntryPointJwt)
                .and()
                .sessionManagement()
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                .and()
                .authorizeRequests()
                // Rutas públicas
                .antMatchers("/api/auth/**", "/test/all", "/public/**").permitAll()
                .antMatchers(HttpMethod.GET, "/api/offer/getAll").permitAll()
                .antMatchers(HttpMethod.GET, "/api/tags/list").permitAll()
                .antMatchers(HttpMethod.GET, "/api/tags/{offerId}").permitAll()
                .antMatchers(HttpMethod.GET, "/api/company/getAll").permitAll()

                // Tags - administración
                .antMatchers(HttpMethod.POST, "/api/tags/add").hasRole("ADMIN")
                .antMatchers(HttpMethod.PUT, "/api/tags").hasRole("ADMIN")
                .antMatchers(HttpMethod.DELETE, "/api/tags/{tagId}").hasRole("ADMIN")

                // Tags - ofertas (COMPANY)
                .antMatchers(HttpMethod.POST, "/api/tags/{offerId}").hasRole("COMPANY")
                .antMatchers(HttpMethod.PUT, "/api/tags/{offerId}").hasRole("COMPANY")
                .antMatchers(HttpMethod.DELETE, "/api/tags/{offerId}/{tagId}").hasRole("COMPANY")

                // Tags - candidatos (CANDIDATE)
                .antMatchers(HttpMethod.GET, "/api/tags/candidate").hasRole("CANDIDATE")
                .antMatchers(HttpMethod.PUT, "/api/tags/candidate").hasRole("CANDIDATE")
                .antMatchers(HttpMethod.DELETE, "/api/tags/candidate/{tagId}").hasRole("CANDIDATE")

                // Ofertas
                .antMatchers(HttpMethod.DELETE, "/api/offer/delete/**").hasRole("COMPANY")
                .antMatchers(HttpMethod.DELETE, "/api/offer/bookmark/**").hasRole("CANDIDATE")
                .antMatchers(HttpMethod.DELETE).hasRole("ADMIN")

                .anyRequest().authenticated()
                .and()
                .addFilterBefore(this.authenticationJwtTokenFilter(), UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }
}