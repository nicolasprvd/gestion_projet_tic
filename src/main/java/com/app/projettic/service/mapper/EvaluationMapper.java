package com.app.projettic.service.mapper;


import com.app.projettic.domain.*;
import com.app.projettic.service.dto.EvaluationDTO;

import org.mapstruct.*;

/**
 * Mapper for the entity {@link Evaluation} and its DTO {@link EvaluationDTO}.
 */
@Mapper(componentModel = "spring", uses = {})
public interface EvaluationMapper extends EntityMapper<EvaluationDTO, Evaluation> {


    @Mapping(target = "userExtras", ignore = true)
    @Mapping(target = "removeUserExtra", ignore = true)
    Evaluation toEntity(EvaluationDTO evaluationDTO);

    default Evaluation fromId(Long id) {
        if (id == null) {
            return null;
        }
        Evaluation evaluation = new Evaluation();
        evaluation.setId(id);
        return evaluation;
    }
}
